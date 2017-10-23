'use strict';

// exports
module.exports = {
  init: initdb,
  add_service: add_service,
  get_services: get_services,
  update_service: update_service,
  delete_service: delete_service
};

// requires
const fs = require('fs')
  , nodeCleanup = require('node-cleanup')
  , sqlite3 = require('sqlite3').verbose()
  // , _ = require('lodash')
	// , async = require('async')
	// , bcrypt = require('bcrypt')
	;

// init database connection
let dbconn = new sqlite3.Database(`${__dirname}/broker.db`, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the broker database.');
});

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  console.log(`About to exit with code: ${signal}`);
  dbconn.close();
  console.log('Closed the database connection.');
});

// init db with schema
function initdb() {
  // init db schema
  fs.readFile('config/schema.sql', 'utf8', function (err,data) {
    if (err) {
      console.log(err);
      return;
    }
    dbconn.exec(data);
  });
};

// add service to db
function add_service(name, location, description, endpoints) {
  let now = new Date().getTime();
  // add the service
  dbconn.run('insert into services(name, location, description, registeredsince) values(?,?,?,?)', [name, location, description, now], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`A service has been added: ${this.lastID}`);

    // add the endpoints only after successfully added the service
    endpoints.forEach(function (endpoint) {
      dbconn.run('insert into endpoints(service, name, description) values(?,?,?)', [name, endpoint.name, endpoint.description], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log(`A service endpoint has been added: ${this.lastID}`);
      });
    });
  });
}

// get all service endpoints
//select s.name, s.location, e.name from services as s join endpoints as e on (s.name=e.service) where s.rowid=4;

// update a service in the database, set key-value pairs from the service obj
function update_service(name, serviceobj){
  // prepare sql statement and values
  let keys = [];
  let vals = [];
  Object.keys(serviceobj).forEach(function (key) {
    keys.push(`${key} = ?`);
    vals.push(serviceobj[key]);
  });
  let sql = `update services set ${keys.join(', ')} where name = ?`;
  vals.push(name);

  //run sql statement
  dbconn.run(sql, vals, function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Written ${this.changes} changes.`);
  });
}

// delete a service from the database
function delete_service(name){
  //run sql statement
  dbconn.run('delete from services where name = ?', [name], function(err) {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Deleted ${this.changes} services.`);
  });
}

// get all registered services
function get_services(callback_service, callback_done) {
  dbconn.each('select * from services;', [], (err, service) => {
    if (err) {
      throw err;
    }
    callback_service(service);
  }, () => callback_done());
}
//select s.name, s.location, e.name from services as s join endpoints as e on (s.name=e.service) where s.rowid=4;
