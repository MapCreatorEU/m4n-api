/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2017, MapCreator
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

/* eslint-disable no-unused-vars */

import {AbstractClassError, AbstractMethodError} from '../errors/AbstractError';

/**
 * @private
 */
export default class DataStoreContract {
  constructor() {
    if (this.constructor === DataStoreContract) {
      throw new AbstractClassError();
    }

    if (!this.constructor.available) {
      throw new Error(`${this.constructor.name} is unavailable`);
    }
  }

  /**
   * If the driver is currently available
   * @returns {boolean} - Driver availability
   */
  static get available() {
    throw new AbstractMethodError();
  }

  /**
   * If the storage is secure
   * @returns {boolean} - Secure storage
   */
  static get secure() {
    return false;
  }

  /**
   * Store a value in the storage
   * @param {String} name - Value name
   * @param {*} value - Value
   * @returns {void}
   * @abstract
   */
  set(name, value) {
    throw new AbstractMethodError();
  }

  /**
   * Get a value from the store
   * @param {String} name - Value name
   * @returns {String} - Value
   * @abstract
   */
  get(name) {
    throw new AbstractMethodError();
  }

  /**
   * Remove a value from the store
   * @param {String} name - Value name
   * @returns {void}
   * @abstract
   */
  remove(name) {
    throw new AbstractMethodError();
  }

  /**
   * Clear storage
   * @returns {void}
   */
  clear() {
    this.keys().map(key => this.remove(key));
  }

  /**
   * Storage keys
   * @returns {Array<String>} - Stored keys
   * @abstract
   */
  keys() {
    throw new AbstractMethodError();
  }
}
