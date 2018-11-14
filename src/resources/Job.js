/*
 * BSD 3-Clause License
 *
 * Copyright (c) 2018, MapCreator
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

import ResourceProxy from '../proxy/ResourceProxy';
import DownloadedResource from './base/DownloadedResource';
import CrudBase from './base/CrudBase';
import JobResult from './JobResult';
import JobRevision from './JobRevision';

export default class Job extends CrudBase {
  /**
   * Get the list of associated job results
   * @returns {SimpleResourceProxy} - A proxy for accessing the resource
   */
  get results() {
    return this._proxyResourceList(JobResult, `${this.url}/results`);
  }

  /**
   * Get the list job revisions
   * @returns {ResourceProxy} - A proxy for accessing the resource
   */
  get revisions() {
    const data = {
      jobId: this.id,
    };

    return new ResourceProxy(this.api, JobRevision, null, data);
  }

  /**
   * Resource name
   * @returns {String} - Resource name
   * @abstract
   */
  static get resourceName() {
    return 'jobs';
  }

  /**
   * Get the most up to date preview url
   * @returns {string} - Last preview url
   * @deprecated
   * @see Job#previewUrl
   */
  get lastPreviewUrl() {
    return `${this.url}/revisions/last/result/archive`;
  }

  /**
   * Get the most up to date preview url
   * @returns {string} - Preview url
   */
  get previewUrl() {
    return `${this.url}/preview`;
  }

  /**
   * Get the most up to date archive url
   * @returns {string} - Last archive url
   */
  get lastArchiveUrl() {
    return `${this.url}/output`;
  }

  /**
   * Download the job preview
   * @returns {Promise<DownloadedResource>} - Job result preview
   */
  async downloadPreview() {
    const response = await this.api.axios.get(this.previewUrl, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromAxiosResponse(response);
  }

  /**
   * Get archive blob url
   * @returns {Promise<DownloadedResource>} - Job result output
   */
  async downloadOutput() {
    const response = await this.api.axios.get(this.lastArchiveUrl, {
      responseType: 'arraybuffer',
    });

    return DownloadedResource.fromAxiosResponse(response);
  }

  /**
   * Get the remote output url
   * @returns {Promise<string>} - The url to the output
   * @throws ApiError
   */
  async getOutputUrl() {
    const {data: {data}} = await this.api.axios.get(`${this.url}/output-url`);

    return data.url;
  }
}
