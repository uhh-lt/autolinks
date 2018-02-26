'use strict';

const fs = require('fs');

require('browserify')({
    entries: ['./browser/main.js'],
  })
  .bundle()
  .pipe(fs.createWriteStream('public/javascripts/bundle.js'));

console.log('Bundled browser content.');