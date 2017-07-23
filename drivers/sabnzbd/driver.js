'use strict';

const Homey = require('homey');
const Needle = require('needle');

class SabnzbdDriver extends Homey.Driver {

  onPair(socket) {
    socket.on('check', function(data, callback) {
      Needle.get(data.url + '/sabnzbd/api?mode=queue&output=json&apikey=' + data.api, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          if (!body.error) {
            callback(null, true);
          } else {
            callback(body.error, false);
          }
        }
        else {
          callback(error.message, false);
        }
      });

    });
  }

}

module.exports = SabnzbdDriver;
