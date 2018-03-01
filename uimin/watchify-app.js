'use strict';

const fs = require('fs'),
  watchify = require('watchify'),
  browserify = require('browserify');

const b = browserify({
  entries: ['./browser/main.js'],
  cache: {},
  packageCache: {},
  plugin: [watchify]
});

function bundle() {
  b.bundle().pipe(fs.createWriteStream('public/javascripts/bundle.js'));
}

b.on('update', bundle);
b.on('log', (msg) => console.log(`WATCHIFY: ${msg}`) );

bundle();



