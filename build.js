var bundle = require('browserify')();
var fs = require('fs');

bundle.add('./getscreenmedia');
bundle.bundle({standalone: 'getScreenMedia'}).pipe(fs.createWriteStream('getscreenmedia.bundle.js'));
