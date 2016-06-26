"use strict";
var request = require('request');
// a list of devices, with their 'id' as key
// it is generally advisable to keep a list of
// paired and active devices in your driver's memory.
var devices = {};
var intervalId = {};

// the `init` method is called when your driver is loaded for the first time
module.exports.init = function( devices_data, callback ) {
    devices_data.forEach(function(device_data){
        initDevice( device_data );

        Homey.log(device_data.id);

  })
  //setInterval(monitor, 15000);



  callback(true, null);
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

    return callback( null, 3 );

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
function initDevice( device_data ) {


    devices[ device_data.id ] = {};
    devices[ device_data.id ].data = device_data;
    module.exports.getSettings(device_data, function (err, settings) {
    devices[ device_data.id ].settings = settings;
    Homey.log("Device settings set!")
  });

  //start polling device for readings every 10 seconds
    intervalId[device_data.id] = setInterval(function () {
      monitorSab(devices[device_data.id].data, function(response){
          //reserved for callback
        })
      }, 10000);

}
function monitorSab(device_data, callback) {


      var device = getDeviceByData(device_data);


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
                var downloadspeed = obj.kbpersec; //actualy is in MB/s!


                Homey.log('Current speed:' + downloadspeed + ' MB/s');
                module.exports.realtime( device.data, 'download_speed', downloadspeed );
                Homey.manager( 'insights' ).createEntry('sab-' + device.data.id, downloadspeed, new Date(), function(err, success){
                    if( err ) return Homey.error(err);
                  });



          }
          else{
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
