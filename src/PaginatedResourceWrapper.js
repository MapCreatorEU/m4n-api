/* eslint-disable no-trailing-spaces */
import ResourceCache from './ResourceCache';

/**
 * Used for wrapping {@link PaginatedResourceListing} to make it spa friendly
 */
export default class PaginatedResourceWrapper {
  /**
   *
   * @param {PaginatedResourceListing} listing - Listing result
   * @param {Maps4News} api - Instance of the api
   * @param {Boolean} cacheEnabled - If the pagination cache should be used
   * @param {Number} cacheTime - Amount of seconds to store a value in cache
   * @param {Boolean} shareCache - Share cache across instances
   */
  constructor(listing, api = listing.api, cacheEnabled = api.defaults.cacheEnabled, cacheTime = api.defaults.cacheSeconds, shareCache = api.defaults._shareCache) {

    // Fields
    this._api = api;
    this.cacheEnabled = cacheEnabled;
    this.cacheTime = cacheTime;
    this._shareCache = shareCache;
    this._currentPage = 1;

    /**
     * Available data assembled from the cache
     * @type {Array<ResourceBase>} - Available data
     */
    this.data = [];

    // Internal
    this._localCache = new ResourceCache(api, cacheTime);
    this._cache = this._shareCache ? this.api.cache : this._localCache;
    this._inflight = [];
    this._last = listing;

    this._promiseCallback(listing);
  }

  get _promiseCallback() {
    return result => {
      const query = this.query;

      this._last = result;
      this._query = query;

      this.cache.push(result);

      const inflightId = this.inflight.findIndex(x => x === result.page);

      if (inflightId >= 0) {
        this._inflight.splice(inflightId, 1);
      }

      this.rebuild();
    };
  }

  /**
   * Manually fetch a page. This will change the current page.
   * @param {Number|Array<Number>} pageId - Page(s) to fetch
   * @returns {void}
   */
  get(pageId) {
    if (pageId instanceof Array) {
      pageId.map(this.get);
    } else {
      this._inflight.push(pageId);
      this._last.getPage(pageId).then(this._promiseCallback);
    }
  }

  /**
   * Grab the next page
   * @returns {void}
   */
  next() {
    this.get(++this.currentPage);
  }

  /**
   * Grab the previous page
   * @returns {void}
   */
  previous() {
    this.get(--this.currentPage);
  }

  /**
   * Manually rebuild the data
   * @returns {void}
   */
  rebuild() {
    this.data = this.cache
      .resolve(this.path, this._last.cacheToken)
      .filter(value => typeof value !== 'undefined');
  }

  /**
   * Updates the cached pages.
   * @param {Boolean} flush - Clear the cached path data
   * @returns {void}
   */
  refresh(flush = false) {
    if (flush) {
      this.cache.clear(this.path);
    }

    this.cache
      .collectPages(this.path, this._last.cacheToken)
      .map(page => this.get(page.page));
  }

  /**
   * Returns the page number that is currently being used as a reference point
   * @returns {Number} - The current page
   * @see {@link PaginatedResourceWrapper#next}
   * @see {@link PaginatedResourceWrapper#previous}
   */
  get currentPage() {
    return this._currentPage;
  }

  /**
   * Set the current page number
   * @param {Number} value - page number
   */
  set currentPage(value) {
    this._currentPage = Math.max(1, value);
  }

  /**
   * Get the path of the resource
   * @returns {String} - path
   */
  get path() {
    return this._last.path;
  }

  /**
   * Get the number of pages available
   * @returns {Number} - Page count
   */
  get pageCount() {
    return this._last.pageCount;
  }

  /**
   * Optional search query
   * @default {}
   * @return {Object<String, String|Array<String>>} - Query
   */
  get query() {
    return this._last.query;
  }

  /**
   * Optional search query
   * @param {Object<String, String|Array<String>>} value - Query
   * @throws TypeError
   * @default {}
   * @see {@link ResourceProxy#search}
   */
  set query(value) {
    this._last.query = value;
    this.rebuild();
  }

  /**
   * Get api instance
   * @returns {Maps4News} - Api instance
   */
  get api() {
    return this._api;
  }

  /**
   * Get the active cache instance
   * @returns {ResourceCache} - Cache instance
   */
  get cache() {
    return this._cache;
  }

  /**
   * Get if the shared cache should be used
   * @returns {Boolean} - Should the shared cache be used
   */
  get shareCache() {
    return this._shareCache;
  }

  /**
   * Sets if the shared cache should be used
   * @param {Boolean} value - Should the shared cache be used
   */
  set shareCache(value) {
    this._shareCache = Boolean(value);

    this._cache = this._shareCache ? this.api.cache : this._localCache;
  }

  /**
   * If there is a next page
   * @returns {boolean} - If there is a next page
   */
  get hasNext() {
    return this.inflight === 0 ? this._last.hasNext : this.currentPage < this.pageCount;
  }

  /**
   * If there is a previous page
   * @returns {boolean} - If there is a previous page
   */
  get hasPrevious() {
    return this._last.hasPrevious;
  }

  /**
   * List of page numbers that are still mid-flight
   * @returns {Array} - Page numbers that are still mid-flight
   */
  get inflight() {
    return this._inflight;
  }
}