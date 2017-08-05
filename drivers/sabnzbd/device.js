'use strict';

const Homey = require('homey');
const Sabnzbd = require('./lib/sabnzbd.js');

class SabnzbdDevice extends Homey.Device {

  // this method is called when the Device is inited
  onInit() {

    // Get settings
    this.settings = this.getSettings();
    // If still old settings then convert
    if (!this.settings.url) {
      this.log('No url setting found!')
      this.log(this.settings)
      this.setSettings({
          url: this.settings.urlprefix + '://' + this.settings.host + ':' + this.settings.tcpport,
        })
        .then(this.log)
        .catch(this.error)
    }

    this.log('device init');
    this.log('name:', this.getName());
    this.log('class:', this.getClass());

    this.addFlows();
  }

  addFlows(){
    // Pause Action
    let pause_sabnzbd = new Homey.FlowCardAction('pause_sabnzbd');
    pause_sabnzbd
      .register()
      .on('run', (args, state, callback) => {
        Sabnzbd.pause(this.getSettings(), (err, res) => {
          if( err ) callback(err, false);

          callback(null, true);
        })
      });
    // Resume Action
    let resume_sabnzbd = new Homey.FlowCardAction('resume_sabnzbd');
    resume_sabnzbd
    .register()
    .on('run', (args, state, callback) => {
      Sabnzbd.resume(this.getSettings(), (err, res) => {
        if( err ) callback(err, false);

        callback(null, true);
      })
    });
    // Set Limit
    let setLimit = new Homey.FlowCardAction('setlimit');
    setLimit
    .register()
    .on('run', (args, state, callback) => {
      Sabnzbd.setLimit(this.getSettings(), args.percentage , (err, res) => {
        if( err ) callback(err, false);

        callback(null, true);
      })
    });
  }


}

module.exports = SabnzbdDevice;
