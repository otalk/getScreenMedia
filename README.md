# getScreenMedia

## What is this?

A tiny browser module that gives us a simple API for getting access to a user's screen. It uses https://github.com/HenrikJoreteg/getUserMedia's API.

It gives us a cleaner node.js-style, error-first API and cross-browser handling. No browser support checking necessary, lack of support is treated in the same way as when the user rejects the request: the callback gets passed an error as the first argument.

Suitable for use with browserify/CommonJS on the client. 

If you're not using browserify or you want AMD support use `getscreenmedia.bundle.js`. Note that if no module system is detected it will attach a function called `getScreenMedia` to `window`.


## Installing

```
npm install getscreenmedia
```

## How to use it


With this helper it's clean/simple to get access to a user's camera, mic, etc.

```js
var getScreenMedia = require('getscreenmedia');

getScreenMedia(function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
       console.log('failed');
    } else {
       console.log('got a stream', stream);  
    }
});
```


## Why?

It's ugly and annoying to check for support without this tool. Node-style (error-first) APIs that are cross-browser, installable with npm and runnable on the client === win!

## Error handling

Error handling (denied requests, etc) are handled mostly by the underlying [getUserMedia lib](https://github.com/HenrikJoreteg/getUserMedia). However this adds one more error type:

- `"HTTPS_REQUIRED"`

Because that's a current requirement of Chrome, the only browser that currently supports screensharing.

See the [handling errors section of the getUserMedia lib](https://github.com/HenrikJoreteg/getUserMedia#handling-errors-summary) for details about how errors are handled. 


## License

MIT

## Created By

If you like this, follow: [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

