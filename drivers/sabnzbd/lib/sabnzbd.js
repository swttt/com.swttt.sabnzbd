'use strict'

const Needle = require('needle');

function pause(settings, callback) {
  Needle.get(settings.url + '/sabnzbd/api?mode=pause&output=json&apikey=' + settings.apikey, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (!body.error) {
        callback(null, body);
      } else {
        callback(body.error, false);
      }
    }
    else {
      callback(error.message, false);
    }
  });
}

function resume(settings, callback) {
  Needle.get(settings.url + '/sabnzbd/api?mode=resume&output=json&apikey=' + settings.apikey, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (!body.error) {
        callback(null, body);
      } else {
        callback(body.error, false);
      }
    }
    else {
      callback(error.message, false);
    }
  });
}

function setLimit(settings, percentage, callback) {
  Needle.get(settings.url + '/sabnzbd/api?mode=config&name=speedlimit&value=' + percentage + '&output=json&apikey=' + settings.apikey, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      if (!body.error) {
        callback(null, body);
      } else {
        callback(body.error, false);
      }
    }
    else {
      callback(error.message, false);
    }
  });
}


module.exports = {
  pause: pause,
  resume: resume,
  setLimit: setLimit
}
