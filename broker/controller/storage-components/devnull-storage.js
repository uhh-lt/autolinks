'use strict';

const
  randowords = require('random-words'),
  logger = require('../log')(module)
  ;

// exports
module.exports = {
  init : function(callback){
    logger.info('Initializing /dev/null storage.');
    callback(null);
  },
  read : function read(username, storagekey, callback) {
    // generate some random data
    const triples = [
      {
        subject: 'Simon',
        predicate: 'is',
        object: username,
      },
      {
        subject: 'Simon',
        predicate: 'says',
        object: randowords(1)[0],
      }
    ];
    logger.info(`cowsay ( ${username}, ${JSON.stringify(storagekey)} ) : ${JSON.stringify(triples)}`);
    return callback(null, triples);
  },
  promisedRead: function(username, storagekey){
    return new Promise((resolve, reject) => {
      this.read(username, storagekey, (result, err) =>{
        if(err){
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  write : function write(username, storagekey, storagevalue, callback) {
    logger.info(`echo ( ${username}, ${JSON.stringify(storagekey)}, ${JSON.stringify(storagevalue)} ) > /dev/null`);
    return callback(null);
  },
  promisedWrite: function(username, storagekey, storagevalue){
    return new Promise((resolve, reject) => {
      this.write(username, storagekey, storagevalue, (result, err) =>{
        if(err){
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  info : function info(username, callback) {
    logger.info('Getting dummy info.');
    return callback(null, { user: username, keys: 4711 });
  },
};




