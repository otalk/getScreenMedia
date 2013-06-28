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

    if (window.location.protocol === 'http:') {
        return cb(new Error('HttpsRequired'))
    }

    getUserMedia(constraints, cb);
};
