'use strict';

const
  fs = require('fs'),
  path = require('path');

module.exports = function(callingServerModule) {

  /* get a description for the current server module */
  const parts = callingServerModule.filename.split('/');
  const label = parts[parts.length - 2];

  console.log(`Setting up server '${label}'.`);

  /* make sure the data directory exists, and make it globally available */
  global.__basedir = path.resolve(__dirname);
  const datadir = process.env.DATA_DIR || `../data/${label}`;
  global.__datadir = path.resolve(path.join(__dirname, datadir));
  if (!fs.existsSync(global.__datadir)) { fs.mkdirSync(global.__datadir); }

};

