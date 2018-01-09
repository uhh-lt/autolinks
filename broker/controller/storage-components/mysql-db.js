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
  return this.getStorageResource(username, storagekey)
    .then(
      resource => callback(null, resource),
      err => callback(err, null)
    );
};


module.exports.write = function(username, storagekey, resources, callback) {
  return this.saveResource(resources)
    .then(rid => this.saveStorageItem(username, storagekey).then(sid => Object({sid:sid, rid:rid})))
    .then(ids => this.saveStorageItemToResourceMapping(ids.sid, ids.rid))
    .then(
      res => callback(null, res),
      err => callback(err, null)
    );
};

/**
 * work with Promises here
 * @param resource
 * @return {Promise}
 */
module.exports.saveResource = function(resource) {
  // a resource can be an array of resources, a triple or a string
  if(Array.isArray(resource)) {
    logger.debug('Resource is an array.');
    return this.saveListResource(resource);
  }
  if(resource === Object(resource)){
    logger.debug('Resource is a triple.');
    return this.saveTripleResource(resource);
  }
  // else
  logger.debug('Resource is a string.');
  return this.saveStringResource(resource);
};

/**
 * work with Promises here
 * @param triple
 * @return {Promise}
 */
module.exports.saveTripleResource = function(tripleResource) {
  return new Promise((resolve, reject) => {
    const tripleObj = Triple.asTriple(tripleResource);
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
        return promisedQuery('select get_or_add_tripleResource(?,?,?) as rid', [rid_s, rid_p, rid_o]).then(res => resolve(res.rows[0].rid));
      },
      err => reject(err) // on failure return the respective error
    );
  });
};

module.exports.saveListResource = function(listResource) {

  const promises = listResource.map(resource => this.saveResource(resource));
  return Promise.all(promises)
    .then(
      item_rids => {
        logger.debug(`Saved resources ${item_rids}.`);
        return this.saveListResourceDescriptor(item_rids)
          .then(desc_rid => Object({desc_rid: desc_rid, item_rids: item_rids}));
      }
    ).then(
      ids => Promise
        .all(ids.item_rids.map(item_rid => this.saveListResourceItem(ids.desc_rid, item_rid)))
        .then(ignore_ => ids.desc_rid) // return list descriptor rid
    );

};

module.exports.saveListResourceDescriptor = function(rids) {
  return new Promise((resolve, reject) => {
    const listResourceDescriptor = 'l:[' + rids.join(',') + ']';
    logger.debug(`Saving listResourceDesriptor ${listResourceDescriptor}.`);
    promisedQuery('select get_or_add_listResource(?) as rid', [listResourceDescriptor]).then(
      res => {
        const rid = res.rows[0].rid;
        logger.debug(`Successfully saved resource '${listResourceDescriptor}' with id ${rid}.`);
        return resolve(rid);
      },
      err => reject(err)
    );
  });
};

module.exports.saveListResourceItem = function(desc_rid, item_rid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving list resource item (${desc_rid},${item_rid}).`);
    promisedQuery('select add_listResourceItem(?,?) as existed', [desc_rid, item_rid]).then(
      res => {
        const existed = res.rows[0].existed;
        logger.debug(`Successfully saved list resource item (${desc_rid},${item_rid}). Existed before: ${existed}.`);
        return resolve(existed);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStringResource = function(stringResource) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving resource ${stringResource}.`);
    promisedQuery('select get_or_add_stringResource(?) as rid', [stringResource]).then(
      res => {
        const rid = res.rows[0].rid;
        logger.debug(`Successfully saved resource '${stringResource}' with id ${rid}.`);
        return resolve(rid);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStorageItem = function(username, storagekey) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving storage '${storagekey}' for user '${username}'.`);
    promisedQuery('select get_or_add_storageItem(?,?) as sid', [username, storagekey]).then(
      res => {
        const sid = res.rows[0].sid;
        logger.debug(`Successfully saved storgae '${storagekey}' for user '${username}'.`);
        return resolve(sid);
      },
      err => reject(err)
    );
  });
};

module.exports.saveStorageItemToResourceMapping = function(sid, rid) {
  return new Promise((resolve, reject) => {
    logger.debug(`Saving storage resource mapping (${sid},${rid}).`);
    promisedQuery('select create_storageItemToResourceMapping(?,?) as mapping_existed', [sid, rid]).then(
      res => {
        const mapping_existed = res.rows[0].mapping_existed;
        logger.debug(`Successfully saved storage-resource mapping (${sid},${rid}). Existed before: ${mapping_existed}.`);
        return resolve(mapping_existed);
      },
      err => reject(err)
    );
  });
};

module.exports.getResource = function(rid) {
  return promisedQuery('select * from resources where rid = ?', [rid])
    .then(res => {
      if(!res.rows.length){
        logger.debug(`Resource '${rid}' does not exist`);
        return null;
      }
      const r = res.rows[0];
      if(r.istriple){
        logger.debug(`Requesting triple resource '${rid}'.`);
        return this.getTripleResource(rid);
      }
      if(r.islist){
        logger.debug(`Requesting list resource '${rid}'.`);
        return this.getListResource(rid);
      }
      if(r.isstring){
        logger.debug(`Requesting string resource '${rid}'.`);
        return this.getStringResource(rid);
      }
      throw new Error('This is impossible, a resource has to be one of {list,triple,string}.');
    });
};

module.exports.getStringResource = function(rid) {
  return promisedQuery('select surfaceform from stringResources where rid = ?', [rid])
    .then(res => {
      if(!res.rows.length){
        logger.debug(`String resource '${rid}' does not exist`);
        return null;
      }
      return res.rows[0].surfaceform;
    });
};

module.exports.getTripleResource = function(rid) {
  return promisedQuery('select * from tripleResources where rid = ?;', [rid])
    .then(res => {
      if(!res.rows.length){
        logger.debug(`Triple resource '${rid}' does not exist`);
        return null;
      }
      return Promise.resolve(res.rows[0])
        .then(row => [row.subj, row.pred, row.obj])
        .then(rids => Promise.all(rids.map(rid => this.getResource(rid))))
        .then(resources => new Triple(resources[0], resources[1], resources[2]));
    });
};

module.exports.getListResource = function(rid) {
  return promisedQuery('select * from listResourceItems where rid = ?', rid)
    .then(res => res.rows.map(r => r.itemrid))
    .then(item_rids => Promise.all(item_rids.map(item_rid => this.getResource(item_rid))));
};

module.exports.getStorageResource = function(username, storagekey) {
  return promisedQuery('select s2r.rid as rid from storageItems s, users u, storageItemToResource s2r where s2r.sid = s.sid and s.uid = u.uid and s.storagekey = ? and u.name = ?', [storagekey, username])
    .then(res => {
      if(!res.rows.length){
        logger.debug(`Storage item '${storagekey}' for user '${username}' does not exist`);
        return null;
      }
      return res.rows[0].rid;
    })
    .then(rid => rid && this.getResource(rid) || null);
};

module.exports.createUsergroup = function(name) {
  return promisedQuery('select get_or_add_user( ?, true) as uid', [name])
    .then(res => res.rows[0].uid);
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

