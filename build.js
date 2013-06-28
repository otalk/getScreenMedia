var bundle = require('browserify')(),
    fs = require('fs');


bundle.add('./getscreenmedia');
bundle.bundle({standalone: 'getscreenmedia'}).pipe(fs.createWriteStream('getscreenmedia.bundle.js'));
