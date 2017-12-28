'use strict';

// requires
const
  fs = require('fs'),
  nodeCleanup = require('node-cleanup'),
  mysql = require('mysql'),
  Exception = require('../../model/Exception'),
  Triple = require('../../model/Triple'),
  utils = require('../utils/utils'),
  logger = require('../log')(module);

// connection string: mysql://user:pass@host:port/database?optionkey=optionvalue&optionkey=optionvalue&...
const connectionString = process.env.MYSQL || 'mysql://autolinks:autolinks1@mysql:3306/autolinks?debug=false&connectionLimit=100';
const pool = mysql.createPool(connectionString);
logger.info(`Using ${pool.config.connectionLimit} connections.`);

function withConnection(callback) {
  pool.getConnection(function (err, connection) {
    if (err) {
      return callback(Exception.fromError(err, 'Could not establish connection to database.'), null);
    }
    callback(null, connection);
    connection.on('error', function (err) {
      return callback(Exception.fromError(err, 'Error connecting to database.'), null);
    });
  });
}

function promisedQuery(query, values){
  return new Promise((resolve, reject) => {
    withConnection(function(err, connection){
      if(err){
        return reject(err);
      }
      if(query !== Object(query)){
        query = {
          sql: query,
          values: values,
        };
      }
      connection.query(query, function(err, rows, fields){
        connection.release();
        if(err){
          return reject(Exception.fromError(err, `Query failed: '${query.sql}'.`, query));
        }
        return resolve({rows: rows, fields: fields});
      });
    });
  });
}

module.exports.init = function(callback) {

  // read the script
  fs.readFile('config/storagedb-schema.mysql.sql', 'utf8', function (err,data) {
    if (err) {
      return callback(err);
    }
    // need to load sql script manually

    // remove comments
    data = data.replace(/--.*$/gm, '');
    // remove DELEMITER LINES
    data = data.replace(/^DELIMITER.*$/gm, '');
    // remove new DELEMITERS
    data = data.replace(/\/\//gm, '');
    // // remove newlines
    // data = data.replace(/\n/gm, '');
    // split the queries
    const queries = data.split(/\n\n/g)
      .map(query => query.trim())
      .filter(query => query.length > 0);

    // resolve queries sequentially
    utils.sequentialPromise(queries, promisedQuery)
      .then(
        res => callback(null, res),
        err => callback(err)
      );

  }); // end fs.readFile

};

module.exports.read = function(username, storagekey, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};

module.exports.write = function(username, storagekey, triples, callback) {
  return this.saveResource(triples)
    .then(rid => this.saveToStorage(username, storagekey).then(sid => {return {sid:sid, rid:rid};}))
    .then(ids => this.saveStorageResourceMapping(ids.sid, ids.rid))
    .then(
      res => callback(null, res),
      err => callback(err, null)
    );
};

/**
 * work with Promises here
 * @param triple
 * @return {Promise}
 */
module.exports.saveTriple = function(triple) {
  return new Promise((resolve, reject) => {
    const tripleObj = Triple.asTriple(triple);
    // save resources
    Promise.all([
      this.saveResource(tripleObj.subject),
      this.saveResource(tripleObj.predicate),
      this.saveResource(tripleObj.object),
    ]).then(
      rids => { // on success add triple
        const rid_s = rids[0];
        const rid_p = rids[1];
        const rid_o = rids[2];
        logger.debug(`Saving triple ${rids}.`);
        return promisedQuery('select add_triple(?,?,?) as tid', [rid_s, rid_p, rid_o]).then(res => resolve(res.rows[0].tid));
      },
      err => reject(err) // on failure return the respective error
    );
  });
};

/**
 * work with Promises here
 * @param resource
 * @return {Promise}
 */
module.exports.saveResource = function(resource) {
  // a resource can be an array of triples or a string
  if(Array.isArray(resource)) {
    logger.debug('Resource is an array.');
    const promises = resource.map(triple => this.saveTriple(triple));
    return Promise.all(promises)
      .then(
        tids => {
          logger.debug(`Saved triples ${tids}.`);
          const metaresource = 'l:[' + tids.join(',') + ']';
          return this.saveResource(metaresource).then(rid => {return {rid: rid, tids: tids};});
        }
      ).then(
        ids => Promise.all(ids.tids.map(tid => this.saveResourceTripleMapping(ids.rid, tid))).then(ignore_ => ids.rid)
      );
  }
  // promise to save the resource (this is the recursion anchor)
  return this.saveResourceString(resource);
};

module.exports.saveResourceString = function(resource) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving resource ${resource}.`);
    promisedQuery('select add_resource(?) as rid', [resource]).then(
      res => {
        const rid = res.rows[0].rid;
        logger.debug(`Successfully saved resource '${resource}' with id ${rid}.`);
        return resolve(rid);
      },
      err => reject(err)
    );
  });
}

module.exports.saveToStorage = function(username, storagekey) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving storage '${storagekey}' for user '${username}'.`);
    promisedQuery('select add_to_storage(?,?) as sid', [username, storagekey]).then(
      res => {
        const sid = res.rows[0].sid;
        logger.debug(`Successfully saved storgae '${storagekey}' for user '${username}'.`);
        return resolve(sid);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStorageResourceMapping = function(sid, rid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving storage resource mapping (${sid},${rid}).`);
    promisedQuery('select add_storage_to_resource_mapping(?,?) as mapping_exists', [sid, rid]).then(
      res => {
        const mapping_existed = res.rows[0].mapping_exists;
        logger.debug(`Successfully saved storage-resource mapping (${sid},${rid}). Existed before: ${mapping_existed}.`);
        return resolve(mapping_existed);
      },
      err => reject(err)
    );
  });
};

module.exports.saveResourceTripleMapping = function(rid, tid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving resource triple mapping (${rid},${tid}).`);
    promisedQuery('select add_resource_to_triple_mapping(?,?) as mapping_exists', [rid, tid]).then(
      res => {
        const mapping_existed = res.rows[0].mapping_exists;
        logger.debug(`Successfully saved resource-triple mapping (${rid},${tid}). Existed before: ${mapping_existed}.`);
        return resolve(mapping_existed);
      },
      err => reject(err)
    );
  });
};

module.exports.info = function(username, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};

module.exports.close = function(callback){
  pool.end(function (err) {
    if(err){
      logger.warn(`Closing mysql pool failed.`, err);
      return callback(err);
    }
    // all connections in the pool have ended
  });
  logger.debug('Closed storage database connection.');
  callback(null);
};

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${exitCode} and signal ${signal}.`);
  module.exports.close((err) => {});
});

