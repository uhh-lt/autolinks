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
  read : function read(userid, storagekey, callback) {
    // generate some random data
    const triples = [
      {
        subject: 'Simon',
        predicate: 'is',
        object: userid,
      },
      {
        subject: 'Simon',
        predicate: 'says',
        object: randowords(1)[0],
      }
    ];
    logger.info(`cowsay ( ${userid}, ${JSON.stringify(storagekey)} ) : ${JSON.stringify(triples)}`);
    return callback(null, triples);
  },
  promisedRead: function(userid, storagekey){
    return new Promise((resolve, reject) => {
      this.read(userid, storagekey, (result, err) =>{
        if(err){
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  write : function write(userid, storagekey, storagevalue, callback) {
    logger.info(`echo ( ${userid}, ${JSON.stringify(storagekey)}, ${JSON.stringify(storagevalue)} ) > /dev/null`);
    return callback(null);
  },
  promisedWrite: function(userid, storagekey, storagevalue){
    return new Promise((resolve, reject) => {
      this.write(userid, storagekey, storagevalue, (result, err) =>{
        if(err){
          return reject(err);
        }
        resolve(result);
      });
    });
  },
  info : function info(userid, callback) {
    logger.info('Getting dummy info.');
    return callback(null, { user: userid, keys: 4711 });
  },
};




