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
 * @param userid
 * @param storagekey
 * @param callback = function(err, info)
 */
module.exports.read = function(userid, storagekey, callback) {
  return explicitStorage.read(userid, storagekey, callback);
};

/**
 *
 * @param userid
 * @param storagekey
 */
module.exports.promisedRead = function(userid, storagekey) {
  return explicitStorage.promisedRead(userid, storagekey);
};


/**
 *
 * @param userid
 * @param storagekey
 * @param resourceValue
 * @param callback = function(err)
 */
module.exports.write = function(userid, storagekey, resourceValue, callback) {
  return explicitStorage.write(userid, storagekey, resourceValue, callback);
};

/**
 *
 * @param userid
 * @param storagekey
 * @param resourceValue
 */
module.exports.promisedWrite = function(userid, storagekey, resourceValue) {
  return explicitStorage.promisedWrite(userid, storagekey, resourceValue);
};

/**
 *
 * @param userid
 * @param resourceBefore
 * @param resourceAfter
 * @return {Resource}
 */
module.exports.promisedEditResource = function(userid, resourceBefore, resourceAfter) {
  return explicitStorage.promisedEditResource(userid, resourceBefore, resourceAfter);
};

/**
 *
 * @param userid
 * @param querystring
 * @param caseinsensitive
 * @return [{Resource}]
 */
module.exports.promisedFindResources = function(userid, query, casinsensitive, sourcesonly) {
  return explicitStorage.promisedFindResources(userid, query, casinsensitive, sourcesonly);
};

/**
 *
 * @param userid
 * @param filename
 * @param encoding
 * @param mimetype
 * @param size
 * @param content
 * @param overwrite
 * @return {*}
 */
module.exports.promisedSaveFile = function(userid, filename, encoding, mimetype, size, content, overwrite) {
  return explicitStorage.promisedSaveFile(userid, filename, encoding, mimetype, size, content, overwrite);
};

/**
 *
 * @param userid
 * @param detailed
 * @return {*}
 */
module.exports.promisedListFiles = function(userid, detailed) {
  return explicitStorage.promisedListFiles(userid, detailed);
};

/**
 *
 * @param userid
 * @param did
 * @return {*}
 */
module.exports.promisedDeleteFile = function(userid, did) {
  return explicitStorage.promisedDeleteFile(userid, did);
};

/**
 *
 * @param userid
 * @param did
 * @param target
 * @param did
 * @return {*}
 */
module.exports.promisedGetFile = function(userid, did, target) {
  return explicitStorage.promisedGetFile(userid, did, target);
};

/**
 *
 * @param userid
 * @param did
 * @return {*}
 */
module.exports.promisedGetDocumentInfo = function(userid, did) {
  return explicitStorage.getDocumentInfo(userid, did);
};

/**
 *
 * @param userid
 * @param did
 * @return {*}
 */
module.exports.promisedGetDocumentContent = function(userid, did) {
  return explicitStorage.getDocumentContent(userid, did);
};

/**
 *
 * @param userid
 * @param did
 * @return {*}
 */
module.exports.promisedGetDocumentAnalysis = function(userid, did) {
  return explicitStorage.getDocumentAnalysis(userid, did);
};

/**
 *
 * @param userid
 * @param did
 * @param analysis
 * @return {*}
 */
module.exports.updateDocumentAnalysis = function(userid, did, analysis) {
  return explicitStorage.updateDocumentAnalysis(userid, did, analysis);
};

/**
 *
 * @param userid
 * @param did
 * @param anno
 */
module.exports.addAnnotation = function(userid, did, anno){
  return explicitStorage.addAnnotation(userid, did, anno);
};

/**
 *
 * @return {*}
 */
module.exports.resetData = function () {
  return explicitStorage.resetData();
};

/**
 *
 * @param userid
 * @param callback = function(err, info)
 */
module.exports.info = function(userid, callback) {
  return explicitStorage.info(userid, callback);
};

