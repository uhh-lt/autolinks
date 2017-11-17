'use strict';

// exports
module.exports = {
  init: initdb,
  add_user: add_user,
  get_users: get_users,
  get_user: get_user,
  update_user: update_user,
  delete_user: delete_user
};

// requires
const fs = require('fs')
  , nodeCleanup = require('node-cleanup')
  , sqlite3 = require('sqlite3').verbose()
  , log = require('./log')(module)
  // , _ = require('lodash')
	// , async = require('async')
	// , bcrypt = require('bcrypt')
	;

// init database connection
let dbconn = new sqlite3.Database(`${__dirname}/user.db`, (err) => {
  if (err) {
    log.error(err.message);
  }
  log.info('Connected to user database.');
});

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  log.debug(`About to exit with code: ${signal}`);
  dbconn.close();
  log.debug('Closed the database connection.');
});

// init db with schema
function initdb() {
  // init db schema
  fs.readFile('config/userdb-schema.sql', 'utf8', function (err,data) {
    if (err) {
      log.warn(err.message);
      return err;
    }
    dbconn.exec(data);
  });
};

// add user to db
function add_user(name, location, description, endpoints) {
  return;
}


// update a user in the database, set key-value pairs from the user obj
function update_user(name, serviceobj){
  return;
}


// get a user from the database
function get_user(name, callback){
  return;
}

// delete a service from the database
function delete_user(name){
  return;
}

// get all registered services
function get_users(callback_service, callback_done) {
  return;
}

