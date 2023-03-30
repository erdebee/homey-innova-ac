'use strict';

const Homey = require('homey');

class InnovaACApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('InnovaACApp has been initialized');
  }
}

module.exports = InnovaACApp;
