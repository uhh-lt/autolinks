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
  , logger = require('./log')(module)
  // , _ = require('lodash')
	// , async = require('async')
	// , bcrypt = require('bcrypt')
	;

// init database connection
let dbconn = new sqlite3.Database(`${__dirname}/user.db`, (err) => {
  if (err) {
    logger.error(err.message);
  }
  logger.info('Connected user database.');
});

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${signal}`);
  dbconn.close();
  logger.debug('Closed user database connection.');
});

// init db with schema
function initdb() {
  // init db schema
  fs.readFile('config/userdb-schema.sqlite3.sql', 'utf8', function (err,data) {
    if (err) {
      logger.warn(err.message);
      return err;
    }
    dbconn.exec(data);
  });
};

// add user to db
function add_user(name, password) {
  const now = new Date().getTime();
  // add user
  dbconn.run('insert or replace into users(name, password, lastseen, registeredsince) values(?,?,?,?)', [name, password, now, now], function(err) {
    if (err) {
      return err;
    }
  });
}


// update a user in the database, set key-value pairs from the user obj
function update_user(name, userobj){
  // prepare sql statement and values
  const keys = [];
  const vals = [];
  Object.keys(userobj)
    .filter( key => !Array.isArray(userobj[key]))
    .forEach( key => {
      keys.push(`${key} = ?`);
      vals.push(userobj[key]);
    });
  const sql = `update users set ${keys.join(', ')} where name = ?`;
  vals.push(name);

  //run sql statement
  dbconn.run(sql, vals, function(err) {
    if (err) {
      return err;
    }
  });
}


// get a user from the database
/**
 *
 * @param name username
 * @param next function(err, row)
 */
function get_user(name, next){
  //run sql statement
  dbconn.get('select * from users where name = ?', [name], next);
}

// delete a service from the database
function delete_user(name){
  // delete user
  dbconn.run('delete from users where name = ?', [name], function(err) {
    if (err) {
      return err;
    }
  });
}

// get all registered users
function get_users(callback_service, callback_done) {
  dbconn.each('select * from users;', [], function(err, service) {
    if (err) {
      return err;
    }
    callback_service(service);
  }, () => { return callback_done() } );
}

