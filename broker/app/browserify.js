'use strict';

const fs = require('fs'),
  browserify = require('browserify'),
  logger = require('../controller/log')(module);


const entries_to_bundle = [
  __dirname + '/browser/main.js'
];

const bundle_location = __dirname + '/public/javascripts/bundle.js';

function bundle(b) {
  b.bundle().pipe(fs.createWriteStream(bundle_location));
  logger.info('Bundled browser content.');
}

const b = function(){
  if(process.env.WATCHIFYAPP){
    logger.info('Enabled continous bundling of browser content.');
    const watchify = require('watchify');
    const b = browserify({
      entries: entries_to_bundle,
      cache: {},
      packageCache: {},
      plugin: [ watchify ]
    });
    b.on('update', () => bundle(b));
    b.on('log', msg => logger.info(`WATCHIFY: ${msg}`));
    return b;
  }
  return browserify(entries_to_bundle);
}();

bundle(b);



