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
  return callback(new Exception('NOT YET IMPLEMENTED'));
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
          return this.saveResource(null);
        }
      );
  }
  // promise to save the resource (this is the recursion anchor)
  return saveResourceString(resource);
};

function saveResourceString(resource) {
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

