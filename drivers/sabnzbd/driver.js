"use strict";
var request = require('request');
// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};
var intervalId = {};

// the `init` method is called when your driver is loaded for the first time
module.exports.init = function( devices_data, callback ) {
    devices_data.forEach(initDevice);
  //setInterval(monitor, 15000);



  callback(true, null);
}

module.exports.settings = function( device_data, newSettingsObj, oldSettingsObj, changedKeysArr, callback ) {
    // run when the user has changed the device's settings in Homey.
    // changedKeysArr contains an array of keys that have been changed, for your convenience :)
    //Homey.log(newSettingsObj.pollingrate);
    if(newSettingsObj.pollingrate < 5){callback( __('pair.settingschanged.not_under_5'), null );}
    clearInterval(intervalId[device_data.id]);
    delete intervalId[device_data.id];

     devices[device_data.id].settings.host=newSettingsObj.host;
     devices[device_data.id].settings.tcpport=newSettingsObj.tcpport;
     devices[device_data.id].settings.apikey=newSettingsObj.apikey;
     devices[device_data.id].settings.urlprefix=newSettingsObj.urlprefix;
     devices[device_data.id].settings.pollingrate=newSettingsObj.pollingrate;

    initDeviceInterval(device_data,devices[device_data.id].settings.pollingrate);


    // always fire the callback, or the settings won't change!
    // if the settings must not be saved for whatever reason:
    // callback( "Your error message", null );
    // else
    callback( null, true );

}


// the `added` method is called is when pairing is done and a device has been added
module.exports.added = function( device_data, callback ) {
    initDevice( device_data );

    Homey.manager( 'insights' ).createLog('sab-' + device_data.id, {
        label: {
            nl: 'Download snelheid',
            en: 'Download speed'
        },
        type: 'number',
        units: {
            nl: 'MB/s'
        },
        decimals: 2,
        chart: 'line' // prefered, or default chart type. can be: line, area, stepLine, column, spline, splineArea, scatter
    }, function callback(err , success){
        if( err ) return Homey.error(err);
      });
    Homey.log('Device added! * ' + device_data.id + ' *');
    callback( null, true );
}

// the `delete` method is called when a device has been deleted by a user
module.exports.deleted = function( device_data, callback ) {
    delete devices[ device_data.id ];
    Homey.manager( 'insights' ).deleteLog('sab-' + device_data.id);
    clearInterval(intervalId[device_data.id]);
    delete intervalId[device_data.id];
    Homey.log('Device deleted');
    callback( null, true );
}

// the `pair` method is called when a user start pairing
module.exports.pair = function( socket ) {
    socket.on('list_sabnzbd', function( device, callback ){
      if(device.settings.urlprefix == 'https'){var urlprefix = 'https://';}else{var urlprefix = 'http://';}
      var url = urlprefix + device.settings.host + ':' + device.settings.tcpport + '/api?mode=qstatus&output=json&apikey=' + device.settings.apikey;
      request({
            url: url,
            json: true,
            strictSSL: false
          }, function (error, response, body) {

            if (!error && response.statusCode === 200) {

                callback(null, __('pair.feedback.succesfully_connected'))

          }
          else{
            callback(__('pair.feedback.could_not_connect') + ' ' + error)
          }
        }
    )



})
}



// these are the methods that respond to get/set calls from Homey
// for example when a user pressed a button

module.exports.capabilities = {};
module.exports.capabilities.download_speed = {};
module.exports.capabilities.download_speed.get = function( device_data, callback ) {

    var device = getDeviceByData( device_data );
    if( device instanceof Error ) return callback( device );

    return callback( null, device.OldDownloadSpeed );

}



// a helper method to get a device from the devices list by it's device_data object
function getDeviceByData( device_data ) {
    var device = devices[ device_data.id ];
    if( typeof device === 'undefined' ) {
        return new Error("invalid_device");
    } else {
        return device;
    }
}

// a helper method to add a device to the devices list
function initDevice( device_data, newSettingsObj, callback) {

  module.exports.getSettings( device_data, function( err, settings ){


    //migration from old v0.9.8 app with no settings in device
    if (settings.pollingrate==undefined) {
      Homey.log("No pollingrate found!");
      settings = {
        host: settings.host,
        tcpport: settings.tcpport,
        apikey: settings.apikey,
        urlprefix: settings.urlprefix,
        pollingrate: 10 };
        devices[ device_data.id ].settings = settings;
        initDeviceInterval(device_data,settings.pollingrate);
        module.exports.setSettings( device_data, settings, function( err, settings ){
            // ... dunno what to do here, think nothing...
        })
    }
    else{
      devices[ device_data.id ].settings = settings;
      initDeviceInterval(device_data,settings.pollingrate);
    }
  })
    devices[ device_data.id ] = {};
    devices[ device_data.id ].data = device_data;
    devices[ device_data.id ].currentSlots = "not set";





  }






function initDeviceInterval(device_data,pollingrate){
  intervalId[device_data.id] = setInterval(function () {
    monitorSab(devices[device_data.id], function(response){
        //reserved for callback
      })
    }, pollingrate * 1000);
}



function monitorSab(device_data, callback) {


      var device = device_data;

      Homey.log("Trying " + device.settings.host + " on port " + device.settings.tcpport + " and " + device.settings.urlprefix + " Polling rate is: " + device.settings.pollingrate);
      if(device.settings.urlprefix == 'https'){var urlprefix = 'https://';}else{var urlprefix = 'http://';}

      var url = urlprefix + device.settings.host + ':' + device.settings.tcpport + '/api?mode=qstatus&output=json&apikey=' + device.settings.apikey;
      request({
            url: url,
            json: true,
            strictSSL: false
          }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                module.exports.setAvailable( device.data );
                var obj = body;
                var downloadspeed = obj.kbpersec;
                downloadspeed = downloadspeed / 1000;
                downloadspeed = downloadspeed.toFixed(2);
                downloadspeed = parseFloat(downloadspeed);
                var slots = obj.noofslots_total;



                if(device.currentSlots == "not set"){devices[ device.data.id].currentSlots = slots;}

                if(device.currentSlots < slots){
                  Homey.manager('flow').triggerDevice( 'download_added', device_data, function(err, result){
                      if( err ) return Homey.error(err);
                      Homey.log("Download added!");
                  });

                  devices[ device.data.id].currentSlots = slots;

                }
                else{
                  devices[ device.data.id].currentSlots = slots;
                  Homey.log("No downloads added!");
                }

                Homey.log('Current speed:' + downloadspeed + ' MB/s');
                module.exports.realtime( device.data, 'download_speed', downloadspeed );

                if(devices[ device.data.id].OldDownloadSpeed != downloadspeed){
                Homey.manager( 'insights' ).createEntry('sab-' + device.data.id, downloadspeed, new Date(), function(err, success){
                    if( err ) return Homey.error(err);
                  });
                  devices[ device.data.id].OldDownloadSpeed = downloadspeed;
                }

          }
          else{
            Homey.log("sabNZBd is offline!")
            module.exports.setUnavailable( device.data, "Offline" );
          }
        }
      )



}


Homey.manager('flow').on('action.pause_sabnzbd', function( callback, args ){

  var device = getDeviceByData( args.device );

  Homey.log("Trying to pause sab with the id: " + device.data.id);
  if(device.settings.urlprefix == 'https'){var urlprefix = 'https://';}else{var urlprefix = 'http://';}
  var url = urlprefix + device.settings.host + ':' + device.settings.tcpport + '/api?mode=pause&output=json&apikey=' + device.settings.apikey;
  request({
        url: url,
        json: true
      }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
          Homey.log("sabNZBd paused!");
      }
      else{
        Homey.log("Error: sabNZBd didn't paused!");
      }
    }
  )
  callback( null, true ); // we've fired successfully
});
Homey.manager('flow').on('action.resume_sabnzbd', function( callback, args ){

  var device = getDeviceByData( args.device );

  Homey.log("Trying to resume sab with the id: " + device.data.id);
  if(device.settings.urlprefix == 'https'){var urlprefix = 'https://';}else{var urlprefix = 'http://';}
  var url = urlprefix + device.settings.host + ':' + device.settings.tcpport + '/api?mode=resume&output=json&apikey=' + device.settings.apikey;
  request({
        url: url,
        json: true
      }, function (error, response, body) {

        if (!error && response.statusCode === 200) {
          Homey.log("sabNZBd resumed!");
      }
      else{
        Homey.log("Error: sabNZBd didn't resumed!");
      }
    }
  )
  callback( null, true ); // we've fired successfully
});
