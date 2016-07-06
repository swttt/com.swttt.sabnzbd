# sabNZBd for Homey

With this app you can add your sabNZBd server as device.

Current features:
  - Pause and resume within flows
  - Logging download speed in insights
  - Flow trigger based on new download added (NEW: Now with title label/token)
  - Edit settings and polling rate after the device is added

Usage examples:
  - When watching TV(iptv, streams, netflix etc.), pause your downloads
  - Only download during the night (or other timers)
  - Only download when nobody is home
  - If a new download is added say "A new download arrived on your server!" or do something else.
  - NEW: On download added you now can use the title tag. The title tag contains the movie title (ex. Lord of the strings :)) or the tv show title, season and episode (ex. The bold and the beatifull season 1 episode 666).
  - Well, you can think of some more examples right? ;)

Known issues:
  - (mobile) Device card - this part isn't documented yet and not working. (opened an issue on github with Athom)
  - Adding a device takes a few seconds, should add a confirmation of added window (so the device can load in the background, and a user won't notice the delay)
  - [DONE] HTTPS not (yet) supported

To do:
  - [DONE] Make it possible to edit the settings after adding the device
  - [DONE] Adjustable polling rate (now on every 15 sec)
  - [DONE] Disable device card if device is offline (setAvailable/setUnavailable)
  - Ask homey if something is downloading (build-in speech or flow card)
  - [DONE] Get notified when a download has been added
  - [DONE]Add the ability to create a label on the download added card with the title (filtered to a readable format)(https://github.com/jzjzjzj/parse-torrent-name thnx to Phuturist!)
