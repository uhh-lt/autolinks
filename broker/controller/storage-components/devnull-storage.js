'use strict';

const logger = require('../log')(module)
  , randowords = require('random-words')
  ;



// exports
module.exports = {
  init : function(callback){
    logger.info('Initializing /dev/null storage.');
    callback(null);
  },
  read : function read(username, storagekey, callback) {
    // generate some random data
    const triple = {
      subject: randowords(1),
      predicate: randowords(1),
      object: randowords(1)
    };
    logger.info(`cowsay ( ${username}, ${JSON.stringify(storagekey)} ) : ${JSON.stringify(triple)}`);
    return callback(null, triple);
  },
  write : function write(username, storagekey, storagevalue, callback) {
    logger.info(`echo ( ${username}, ${JSON.stringify(storagekey)}, ${JSON.stringify(storagevalue)} ) > /dev/null`);
    return callback(null);
  },
  info : function info(username, callback) {
    logger.info('Getting dummy info.');
    return callback(null, { user: username, keys: 4711 });
  },
};




