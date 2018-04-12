var adapter = require('webrtc-adapter');
// cache for constraints and callback
var cache = {};

module.exports = function (constraints, cb) {
    var hasConstraints = arguments.length === 2;
    var callback = hasConstraints ? cb : constraints;
    var error;

    if (typeof window === 'undefined' || window.location.protocol === 'http:') {
        error = new Error('NavigatorUserMediaError');
        error.name = 'HTTPS_REQUIRED';
        return callback(error);
    }

    if (adapter.browserDetails.browser === 'chrome') {
        var chromever = adapter.browserDetails.version;
        var isCef = !window.chrome.webstore;

        // check that the extension is installed by looking for a
        // sessionStorage variable that contains the extension id
        // this has to be set after installation unless the content
        // script does that
        if (sessionStorage.getScreenMediaJSExtensionId) {
            chrome.runtime.sendMessage(sessionStorage.getScreenMediaJSExtensionId,
                {type:'getScreen', id: 1}, null,
                function (data) {
                    if (!data || data.sourceId === '') { // user canceled
                        var error = new Error('NavigatorUserMediaError');
                        error.name = 'NotAllowedError';
                        callback(error);
                    } else {
                        constraints = (hasConstraints && constraints) || {audio: false, video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                maxWidth: window.screen.width,
                                maxHeight: window.screen.height,
                                maxFrameRate: 3
                            }
                        }};
                        constraints.video.mandatory.chromeMediaSourceId = data.sourceId;
                        window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                            callback(null, stream);
                        }).catch(function (err) {
                            callback(err);
                        });
                    }
                }
            );
        } else if (window.cefGetScreenMedia) {
            //window.cefGetScreenMedia is experimental - may be removed without notice
            window.cefGetScreenMedia(function(sourceId) {
                if (!sourceId) {
                    var error = new Error('cefGetScreenMediaError');
                    error.name = 'CEF_GETSCREENMEDIA_CANCELED';
                    callback(error);
                } else {
                    constraints = (hasConstraints && constraints) || {audio: false, video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            maxWidth: window.screen.width,
                            maxHeight: window.screen.height,
                            maxFrameRate: 3
                        }
                    }};
                    constraints.video.mandatory.chromeMediaSourceId = sourceId;
                    window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                        callback(null, stream);
                    }).catch(function (err) {
                        callback(err);
                    });
                }
            });
        } else if (isCef || (chromever >= 26 && chromever <= 35)) {
            // chrome 26 - chrome 33 way to do it -- requires bad chrome://flags
            // note: this is basically in maintenance mode and will go away soon
            constraints = (hasConstraints && constraints) || {
                video: {
                    mandatory: {
                        googLeakyBucket: true,
                        maxWidth: window.screen.width,
                        maxHeight: window.screen.height,
                        maxFrameRate: 3,
                        chromeMediaSource: 'screen'
                    }
                }
            };
            window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                callback(null, stream);
            }).catch(function (err) {
                callback(err);
            });
        } else {
            // chrome 34+ way requiring an extension
            var pending = window.setTimeout(function () {
                error = new Error('NavigatorUserMediaError');
                error.name = 'EXTENSION_UNAVAILABLE';
                return callback(error);
            }, 1000);
            cache[pending] = [callback, hasConstraints ? constraints : null];
            window.postMessage({ type: 'getScreen', id: pending }, '*');
        }
    } else if (adapter.browserDetails.browser === 'firefox') {
        if (adapter.browserDetails.version >= 33) {
            constraints = (hasConstraints && constraints) || {
                video: {
                    mozMediaSource: 'window',
                    mediaSource: 'window'
                }
            };
            window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                callback(null, stream);
                var lastTime = stream.currentTime;
                var polly = window.setInterval(function () {
                    if (!stream) window.clearInterval(polly);
                    if (stream.currentTime == lastTime) {
                        window.clearInterval(polly);
                        if (stream.onended) {
                            stream.onended();
                        }
                    }
                    lastTime = stream.currentTime;
                }, 500);
            }).catch(function (err) {
                callback(err);
            });
        } else {
            error = new Error('NavigatorUserMediaError');
            error.name = 'EXTENSION_UNAVAILABLE'; // does not make much sense but...
            callback(error);
        }
    } else if (adapter.browserDetails.browser === 'MicrosoftEdge') {
        if ('getDisplayMedia' in window.navigator) {
            window.navigator.getDisplayMedia({video: true}).then(function (stream) {
                callback(null, stream);
            }).catch(function (err) {
                callback(err);
            });
        } else {
            error = new Error('Screensharing is not supported');
            error.name = 'NotSupportedError';
            callback(error);
        }
    }
};

typeof window !== 'undefined' && window.addEventListener('message', function (event) {
    if (event.origin != window.location.origin) {
        return;
    }
    if (event.data.type == 'gotScreen' && cache[event.data.id]) {
        var data = cache[event.data.id];
        var constraints = data[1];
        var callback = data[0];
        delete cache[event.data.id];

        if (event.data.sourceId === '') { // user canceled
            var error = new Error('NavigatorUserMediaError');
            error.name = 'NotAllowedError';
            callback(error);
        } else {
            constraints = constraints || {audio: false, video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    maxWidth: window.screen.width,
                    maxHeight: window.screen.height,
                    maxFrameRate: 3
                }
            }};
            constraints.video.mandatory.chromeMediaSourceId = event.data.sourceId;
            window.navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
                callback(null, stream);
            }).catch(function (err) {
                callback(err);
            });
        }
    } else if (event.data.type == 'getScreenPending') {
        window.clearTimeout(event.data.id);
    }
});
