// Polyfill for terrible browsers (looking at you IE)
import 'babel-polyfill';

import {isParentOf} from './utils/reflection';
import OAuth from './oauth/OAuth';
import {makeRequest} from './utils/requests';
import ApiError from './exceptions/ApiError';
import ValidationError from './exceptions/ValidationError';
import ResourceProxy from './ResourceProxy';
import Color from './crud/Color';
import Choropleth from './crud/Choropleth';
import Contract from './crud/Contract';
import DimensionSet from './crud/DimensionSet';
import Dimension from './crud/Dimension';
import Faq from './crud/Faq';
import Feature from './crud/Feature';
import Group from './crud/Group';
import FontFamily from './crud/FontFamily';
import Font from './crud/Font';
import Highlight from './crud/Highlight';
import InsetMap from './crud/InsetMap';
import User from './crud/User';
import Notification from './crud/Notification';
import Language from './crud/Language';
import Layer from './crud/Layer';
import Mapstyle from './crud/Mapstyle';
import Permission from './crud/Permission';
import MapstyleSet from './crud/MapstyleSet';
import JobShare from './crud/JobShare';
import Job from './crud/Job';
import JobType from './crud/JobType';
import Organisation from './crud/Organisation';
import PlaceName from './crud/PlaceName';
import Svg from './crud/Svg';
import SvgSetType from './crud/SvgSetType';
import SvgSet from './crud/SvgSet';

export default class Maps4News {
  constructor(auth, host = 'https://api.maps4news.com') {
    if (!isParentOf(OAuth, auth)) {
      throw new TypeError('auth must be an instance of OAuth');
    }

    this.auth = auth;
    this.host = host;
    this.version = 'v1';
  }

  get authenticated() {
    return this.auth.authenticated;
  }

  get host() {
    return this._host;
  }

  set host(value) {
    this._host = value;
    this.auth.host = value;
  }

  authenticate() {
    return new Promise((resolve, reject) => {
      this.auth.authenticate().then(() => {
        this.auth.token.save();

        resolve(this);
      }).catch(reject);
    });
  }

  // Basic authenticated requests with error handling
  request(url, method = 'GET', data = {}, headers = {}, responseType = '', raw = false) {
    if (!url.startsWith('http')) {
      // Removes '/' at the start of the string (if any)
      url = url.replace(/(^\/+)/, () => '');
      url = this._host + '/' + this.version + '/' + url;
    }

    headers.Authorization = this.auth.token.toString();

    return new Promise((resolve, reject) => {
      makeRequest(url, method, data, headers, responseType).then(request => {
        if (request.getResponseHeader('Content-Type') !== 'application/json') {
          resolve(raw ? request : request.response);
        } else {
          const response = JSON.parse(request.responseText);

          if (!response.success) {
            const err = response.error;

            if (!err.validation_errors) {
              reject(new ApiError(err.type, err.message, request.status));
            } else {
              reject(new ValidationError(err.type, err.message, request.status, err.validation_errors));
            }
          } else {
            // Return an empty object if no data has been sent
            // instead of returning undefined.
            resolve(raw ? request : (response.data || {}));
          }
        }
      }).catch(request => {
        const err = JSON.parse(request.responseText).error;

        reject(new ApiError(err.type, err.message, request.status));
      });
    });
  }

  // resource bindings
  get choropleths() {
    return new ResourceProxy(this, Choropleth);
  }

  get colors() {
    return new ResourceProxy(this, Color);
  }

  get contracts() {
    return new ResourceProxy(this, Contract);
  }

  get dimensions() {
    return new ResourceProxy(this, Dimension);
  }

  get dimensionSets() {
    return new ResourceProxy(this, DimensionSet);
  }

  get faqs() {
    return new ResourceProxy(this, Faq);
  }

  get features() {
    return new ResourceProxy(this, Feature);
  }

  get fonts() {
    return new ResourceProxy(this, Font);
  }

  get fontFamilies() {
    return new ResourceProxy(this, FontFamily);
  }

  get groups() {
    return new ResourceProxy(this, Group);
  }

  get highlights() {
    return new ResourceProxy(this, Highlight);
  }

  get insetMaps() {
    return new ResourceProxy(this, InsetMap);
  }

  get jobs() {
    return new ResourceProxy(this, Job);
  }

  get jobShares() {
    return new ResourceProxy(this, JobShare);
  }

  get jobTypes() {
    return new ResourceProxy(this, JobType);
  }

  get languages() {
    return new ResourceProxy(this, Language);
  }

  get layers() {
    return new ResourceProxy(this, Layer);
  }

  get mapstyles() {
    return new ResourceProxy(this, Mapstyle);
  }

  get mapstylesSets() {
    return new ResourceProxy(this, MapstyleSet);
  }

  get notifications() {
    return new ResourceProxy(this, Notification);
  }

  get organisations() {
    return new ResourceProxy(this, Organisation);
  }

  get permissions() {
    return new ResourceProxy(this, Permission);
  }

  get placeNames() {
    return new ResourceProxy(this, PlaceName);
  }

  get svgs() {
    return new ResourceProxy(this, Svg);
  }

  get svgSets() {
    return new ResourceProxy(this, SvgSet);
  }

  get svgSetTypes() {
    return new ResourceProxy(this, SvgSetType);
  }

  get users() {
    return new ResourceProxy(this, User);
  }
}
