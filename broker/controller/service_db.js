'use strict';

// exports
module.exports = {
  init : initdb,
  add_service : add_service,
  get_services : get_services,
  get_joined_services_and_endpoints : get_joined_services_and_endpoints,
  get_service : get_service,
  update_service : update_service,
  update_endpoint : update_endpoint,
  delete_service : delete_service
};

// requires
const
  fs = require('fs'),
  nodeCleanup = require('node-cleanup'),
  sqlite3 = require('sqlite3').verbose(),
  logger = require('./log')(module)
	;

// database connection variable
let dbconn;

/**
 * init db with schema
 * @param callback = function(err)
 */
function initdb(callback) {
  dbconn = new sqlite3.Database(`${__dirname}/../data/service.sqlite3.db`, (err) => {
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
}

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${signal}`);
  if(dbconn) {
    dbconn.close();
    logger.debug('Closed service database connection.');
  }
});

// add service to db
function add_service(name, location, description, endpoints) {
  const now = new Date().getTime();
  // add the service
  dbconn.run('insert or replace into services(name, location, description, registeredsince) values(?,?,?,?)', [name, location, description, now], function(err) {
    if (err) {
      return err;
    }

    // add the endpoints only after successfully added the service
    endpoints.forEach(function (ep) {
      dbconn.run('insert or replace into endpoints(service, path, method, requireslogin) values(?,?,?,?)', [name, ep.path, ep.method, ep.requireslogin], function(err) {
        if (err) {
          return err;
        }
      });
    });
  });
}

// get all service endpoints
//select s.name, s.location, e.name from services as s join endpoints as e on (s.name=e.service) where s.rowid=4;

// update a service in the database, set key-value pairs from the service obj
function update_service(name, serviceobj){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(serviceobj)
    .filter( key => !Array.isArray(serviceobj[key]))
    .forEach( key => {
      keys.push(`${key} = ?`);
      vals.push(serviceobj[key]);
  });
  const sql = `update services set ${keys.join(', ')} where name = ?`;
  vals.push(name);

  //run sql statement
  dbconn.run(sql, vals, function(err) {
    if (err) {
      return err;
    }
  });

}

// update a service in the database, set key-value pairs from the service obj
function update_endpoint(servicename, path, endpointobj){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(endpointobj)
    .filter( key => !Array.isArray(endpointobj[key]))
    .forEach( key => {
      keys.push(`${key} = ?`);
      vals.push(endpointobj[key]);
  });
  const sql = `update endpoints set ${keys.join(', ')} where service = ? and path = ?`;
  vals.push(servicename);
  vals.push(path);

  //run sql statement
  dbconn.run(sql, vals, function(err) {
    if (err) {
      return err;
    }
  });
}

// get a service from the database
function get_service(name, callback){
  //run sql statement
  dbconn.get('select * from services where name = ?', [name], (err, row) => {
    if (err) {
      return err;
    }
    if(!row) {
      return new Error(`Service '${name}' not found.`);
    }
    return callback(row);
  });
}

// delete a service from the database
function delete_service(name){
  // delete service
  dbconn.run('delete from services where name = ?', [name], function(err) {
    if (err) {
      return err;
    }
    // on success, delete endpoints associated with that service
    dbconn.run('delete from endpoints where service = ?', [name], function(err) {
      if (err) {
        return err;
      }
    });
  });
}

// get all registered services
function get_services(callback_service, callback_done) {
  dbconn.each('select * from services;', [], function(err, service) {
    if (err) {
      return err;
    }
    callback_service(service);
  }, () => { return callback_done(); } );
}


// get all registered services and their endpoints
function get_joined_services_and_endpoints(callback_endpointdef, callback_done) {
  const sqlstmnt = 'select * from services as s left join endpoints as e on (s.name=e.service);';
  if(callback_done){
    dbconn.each(sqlstmnt, [], function(err, row) {
      if (err) {
        return err;
      }
      callback_endpointdef(row);
    }, () => { return callback_done(); } );
    return;
  }
  dbconn.all(sqlstmnt, [], callback_endpointdef);
}
