// getScreenMedia helper by @HenrikJoreteg
var getUserMedia = require('getusermedia');

module.exports = function (constraints, cb) {
    var hasConstraints = arguments.length === 2;
    var callback = hasConstraints ? cb : constraints;
    var error;

    if (typeof window === 'undefined' || window.location.protocol === 'http:') {
        error = new Error('NavigatorUserMediaError');
        error.name = 'HTTPS_REQUIRED';
        return callback(error);
    }

    constraints = (hasConstraints && constraints) || { 
        video: {
            mandatory: {
                maxWidth: window.screen.width,
                maxHeight: window.screen.height,
                maxFrameRate: 3,
                chromeMediaSource: 'screen'
            }
        }
    };
    getUserMedia(constraints, callback);
};
