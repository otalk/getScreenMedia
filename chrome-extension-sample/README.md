This is an example app which implements the extension-side of [getscreenmedia](https://github.com/henrikjoreteg/getscreenmedia).

The browser useѕ [chrome.runtime.sendMessage](https://developer.chrome.com/extensions/runtime#method-sendMessage) to talk to the backend script which calls [chooseDesktopMedia](https://developer.chrome.com/extensions/desktopCapture) and returns the sourceId of the chosen window. This sourceId has to be passed back to getUserMedia.

See also [the tutorial for using inline installation](https://developer.chrome.com/webstore/inline_installation).

Running (for testing):
    google-chrome --load-and-launch-app=/path/to/this/directory
