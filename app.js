'use strict';

const Homey = require('homey');

class SabnzbdApp extends Homey.App {

	onInit() {

		this.log('Sabnzbd is running...');

	}

}

module.exports = SabnzbdApp;
