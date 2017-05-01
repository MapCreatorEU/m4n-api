import CrudBase from './base/CrudBase';

export default class JobShare extends CrudBase {
  constructor(api, data = {}) {
    super(api, data);

    this.resourceName = 'job-shares';
    this.path = '/jobs/shares/{id}';
  }

  save() {
    throw new Error('Unsupported method JobShare::save');
  }

  static get visibility() {
    return JobShareVisibility;
  }
}

class JobShareVisibility {
  static get PRIVATE() {
    return 'private';
  }

  static get ORGANISATION() {
    return 'organisation';
  }
}