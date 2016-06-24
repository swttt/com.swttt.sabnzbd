# sabNZBd for Homey

With this app you can add your sabNZBd server as device.

Current features:
  - Pause and resume within flows
  - Logging download speed in insights

Known issues:
  - (mobile) Device card - this part isn't documented yet and not working. (opened an issue on github with Athom)
  - Adding a device takes a few seconds, should add a confirmation of added window (so the device can load in the background, and a user won't notice the delay)
  - HTTPS not (yet) supported

To do:
  - Make it possible to edit the settings after adding the device
  - Adjustable polling rate (now on every 15 sec)
  - Disable device card if device is offline (setAvailable/setUnavailable)
  - Add condition flow or build in speech to ask if something is downloaded
  - Get notified when a download has been added
