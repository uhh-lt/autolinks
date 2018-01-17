'use strict';

const logger = require('./log')(module);

const explicitStorage  = (() => {
  switch (process.env.STORAGE) {
    case 'mysql':
      logger.info('Using mysql-db');
      return require('./storage-components/mysql-db');
    case 'none': // fall-through
    case '/dev/null':  // fall-through
    default:
      logger.info('No storage used (/dev/null).');
      return require('./storage-components/devnull-storage');
  }
})();

/**
 *
 * @param callback = function(err)
 */
module.exports.init = function(callback) {
  return explicitStorage.init(callback);
};

/**
 *
 * @param username
 * @param storagekey
 * @param callback = function(err, info)
 */
module.exports.read = function(username, storagekey, callback) {
  return explicitStorage.read(username, storagekey, callback);
};

/**
 *
 * @param username
 * @param storagekey
 */
module.exports.promisedRead = function(username, storagekey) {
  return explicitStorage.promisedRead(username, storagekey);
};


/**
 *
 * @param username
 * @param storagekey
 * @param resourceValue
 * @param callback = function(err)
 */
module.exports.write = function(username, storagekey, resourceValue, callback) {
  return explicitStorage.write(username, storagekey, resourceValue, callback);
};

/**
 *
 * @param username
 * @param storagekey
 * @param resourceValue
 */
module.exports.promisedWrite = function(username, storagekey, resourceValue) {
  return explicitStorage.promisedWrite(username, storagekey, resourceValue);
};

/**
 *
 * @param username
 * @param callback = function(err, info)
 */
module.exports.info = function(username, callback) {
  return explicitStorage.info(username, callback);
};
