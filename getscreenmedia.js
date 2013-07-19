// getScreenMedia helper by @HenrikJoreteg
var getUserMedia = require('getusermedia');

module.exports = function (cb) {
    var constraints = {
            video: {
                mandatory: {
                    chromeMediaSource: 'screen'
                }
            }
        };
    var error;

    if (window.location.protocol === 'http:') {
        error = new Error('NavigatorUserMediaError');
        error.reason = 'HTTPS_REQUIRED';
        return cb();
    }

    if (!navigator.webkitGetUserMedia) {
        error = new Error('NavigatorUserMediaError');
        error.reason = 'NOT_SUPPORTED';
        return cb(error);
    }

    getUserMedia(constraints, cb);
};
