'use strict';

const logger = require('./log')(module);

module.exports = {
  read : read,
  write : write,
  info : info,
};

const explicitStorage  = (() => {
  switch (process.env.STORAGE) {
    case 'mysql':
      logger.info('Using mysql-db');
      return require('./storage-components/mysql-db')({

      });
    case 'none': // fall-through
    case '/dev/null': // fall-through
    default:
      logger.info('No storage used (/dev/null).');
      return require('./storage-components/devnull-storage');
  }
})();

/**
 *
 * @param username
 * @param storagekey
 * @param callback = function(err, info)
 */
function read(username, storagekey, callback) {
  return explicitStorage.read(username, storagekey, callback);
}

/**
 *
 * @param username
 * @param storagekey
 * @param storagevalue = { subj, pred, obj }
 * @param callback = function(err)
 */
function write(username, storagekey, storagevalue, callback) {
  return explicitStorage.write(username, storagekey, storagevalue, callback);
}

/**
 *
 * @param username
 * @param callback = function(err, info)
 */
function info(username, callback) {
  return explicitStorage.info(username, callback);
}
