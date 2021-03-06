'use strict';

/* imports */
const fs = require('fs'),
  path = require('path'),
  nodeCleanup = require('node-cleanup'),
  sqlite3 = require('sqlite3').verbose(),
  logger = require('./log')(module);

// database connection variable
let dbconn;

/**
 * init db with schema
 * @param callback = function(err)
 */
module.exports.init = function(callback) {
  dbconn = new sqlite3.Database(path.resolve(global.__datadir && path.join(global.__datadir, 'service.sqlite3.db') || 'service.sqlite3.db'), (err) => {
    if (err) {
      return callback(err);
    }
    logger.info('Connected service database.');

    // init db schema
    fs.readFile('config/servicedb-schema.sqlite3.sql', 'utf8', function (err, data) {
      if (err) {
        return callback(err);
      }
      dbconn.exec(data, function(err){
        if (err) {
          return callback(err);
        }
        logger.info('Initialized database schema.');
      });
    });
  });
};

// add service to db
module.exports.add_service = function(name, version, location, description, endpoints, callback_service, callback_endpoint, callback_done) {
  const now = new Date().getTime();
  // add the service
  dbconn.run('insert or replace into services(name, version, location, description, registeredsince) values(?,?,?,?,?)', [name, version, location, description, now], function(err) {
    if (err) {
      return callback_service(err);
    }
    callback_service(null);

    // add the endpoints only after successfully added the service
    endpoints.forEach(function (ep) {
      dbconn.run('insert or replace into endpoints(service, version, path, method, requirements, requireslogin) values(?,?,?,?,?,?)', [name, version, ep.path, ep.method, ep.requirements, ep.requireslogin], function(err) {
        if(err){
          return callback_endpoint(ep, err);
        }
        callback_endpoint(ep, null);
      });
    });

    callback_done(null);
  });
};

// update a service in the database, set key-value pairs from the service obj
module.exports.update_service = function(name, version, serviceobj, callback){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(serviceobj)
    .filter( key => !Array.isArray(serviceobj[key]))
    .forEach( key => {
      keys.push(`${key} = ?`);
      vals.push(serviceobj[key]);
  });
  const sql = `update services set ${keys.join(', ')} where name = ? and version = ?`;
  vals.push(name);
  vals.push(version);

  //run sql statement
  dbconn.run(sql, vals, callback);
};

// update a service in the database, set key-value pairs from the service obj
module.exports.update_endpoint = function(servicename, path, version, endpointobj, callback){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(endpointobj)
    .filter( key => !Array.isArray(endpointobj[key]))
    .forEach( key => {
      keys.push(`${key} = ?`);
      vals.push(endpointobj[key]);
  });
  const sql = `update endpoints set ${keys.join(', ')} where service = ? and version = ? and path = ?`;
  vals.push(servicename);
  vals.push(version);
  vals.push(path);

  //run sql statement
  dbconn.run(sql, vals, callback);
};

// get a service from the database
module.exports.get_service = function(name, version, callback){
  //run sql statement
  dbconn.get('select * from services where name = ? and version = ?', [name, version], (err, row) => {
    if (err) {
      return callback(err, null);
    }
    if(!row) {
      return callback(new Error(`Service '${name}:${version}' not found.`), null);
    }
    callback(null, row);
  });
};


// get a service from the database
module.exports.get_service_endpoint = function(serviceref, endpointref, callback){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(serviceref)
    .filter( key => !Array.isArray(serviceref[key]))
    .forEach( key => {
      keys.push(`s.${key} = ?`);
      vals.push(serviceref[key]);
    });
  Object.keys(endpointref)
    .filter( key => !Array.isArray(endpointref[key]))
    .forEach( key => {
      keys.push(`e.${key} = ?`);
      vals.push(endpointref[key]);
    });

  //run sql statement
  const sqlstmnt = `select * from services as s left join endpoints as e on (s.name=e.service AND s.version=e.version) where ${keys.join(' AND ')};`;
  dbconn.get(sqlstmnt, vals, callback);
};

// delete a service from the database
module.exports.delete_service = function(name, version, callback){
  // delete service
  dbconn.run('delete from services where name = ? and version = ?', [name, version], function(err) {
    if (err) {
      return callback(err);
    }
    // on success, delete endpoints associated with that service
    dbconn.run('delete from endpoints where service = ? and version = ?', [name, version], callback);
  });
};

// get all registered services
module.exports.get_services = function(callback_service, callback_done) {
  dbconn.each('select * from services;', [], callback_service, callback_done );
};


// get all registered services and their endpoints
module.exports.get_joined_services_and_endpoints = function(callback_endpointdef, callback_done) {
  const sqlstmnt = 'select * from services as s left join endpoints as e on (s.name=e.service);';
  if(callback_done){
    return dbconn.each(sqlstmnt, [], callback_endpointdef, callback_done);

  }
  dbconn.all(sqlstmnt, [], callback_endpointdef);
};

/**
 *
 * get all registered services and their endpoints
 *
 * @param servicename
 * @param callback = function(err, rows)
 *
 */
module.exports.get_joined_service_and_endpoints = function(servicename, callback) {
  dbconn.all(
    'select * from services as s left join endpoints as e on (s.name=e.service and s.name = ?);',
    [ servicename ],
    callback
  );
};


// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${signal}`);
  if(dbconn) {
    dbconn.close();
    logger.debug('Closed service database connection.');
  }
});
