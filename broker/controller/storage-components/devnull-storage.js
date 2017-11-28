'use strict';

const logger = require('../log')(module)
  , rw = require('random-words')
  ;



// exports
module.exports = {
  read : function read(username, storagekey, callback) {
    // generate some random data
    const triple = {
      subject: rw(),
      predicate: rw(),
      object: rw()
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




