/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2020, Mapcreator
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 *  Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 *  Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import ky from 'ky-universal';
import { AbstractClassError, AbstractMethodError } from '../errors/AbstractError';
import StorageManager from '../storage/StorageManager';
import OAuthToken from './OAuthToken';
import StateContainer from './StateContainer';
import { makeCancelable } from '../utils/helpers';

/**
 * OAuth base class
 * @abstract
 */
export default class OAuth {
  token = null;
  path = '/';
  host = process.env.HOST;

  /**
   * @param {String} clientId - OAuth client id
   * @param {Array<String>} scopes - A list of required scopes
   */
  constructor (clientId, scopes = ['*']) {
    if (this.constructor === OAuth) {
      throw new AbstractClassError();
    }

    this.clientId = String(clientId);
    this.scopes = scopes;

    if (this.clientId) {
      this.token = OAuthToken.recover();
    }
  }

  /**
   * If the current instance has a valid token
   * @returns {Boolean} - If a valid token is available
   */
  get authenticated () {
    return this.token !== null && !this.token.expired;
  }

  /**
   * Authenticate
   * @returns {Promise<OAuthToken>} - Authentication token
   * @throws {OAuthError}
   * @abstract
   */
  authenticate () {
    throw new AbstractMethodError();
  }

  /**
   * Forget the current session
   * Empty the session token store and forget the api token
   */
  forget () {
    StateContainer.clean();
    StorageManager.secure.remove(OAuthToken.storageName);

    this.token = null;
  }

  /**
   * Invalidates the session token
   * @throws {OAuthError} - If de-authentication fails
   * @throws {ApiError} - If the api returns errors
   * @returns {CancelablePromise}
   */
  logout () {
    if (!this.token) {
      return makeCancelable(() => {});
    }

    const url = `${this.host}/oauth/logout`;

    return makeCancelable(async signal => {
      await ky.post(url, {
        headers: {
          Accept: 'application/json',
          Authorization: this.token.toString(),
        },
        signal,
      });

      this.forget();
    });
  }

  /**
   * Manually import OAuthToken, usefull for debugging
   * @param {String} token - OAuth token
   * @param {String} [type=Bearer] - token type
   * @param {Date|Number} [expires=5 days] - expire time in seconds or Date
   * @param {Array<string>} [scopes=[]] - Any scopes
   */
  importToken (token, type = 'Bearer', expires = 432000, scopes = []) {
    this.token = new OAuthToken(token, type, expires, scopes);
  }
}
