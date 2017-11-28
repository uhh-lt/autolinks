'use strict';

// exports
module.exports = {
  init: initdb,
  add_entry: add_entry,
  get_entry: get_entry,
  update_entry: update_entry,
  delete_entry: delete_entry,
  prepare_info: prepare_info,
};

// requires
const logger = require('./log')(module)
  , fs = require('fs')
  , nodeCleanup = require('node-cleanup')
  , mysql = require('mysql')
	;

// try connectiontring: 'mysql://user:pass@host/db?debug=true&charset=BIG5_CHINESE_CI&timezone=-0700&connectionlimit=100'
const pool = mysql.createPool({
  connectionLimit : 100, //important
  host     : process.env.MYSQLHOST || 'localhost',
  user     : 'autolinks',
  password : 'autolinks',
  database : 'autolinks',
  debug    :  false
});

function initdb(callback) {

  // read the script
  fs.readFile('config/userdb-schema.sql', 'utf8', function (err,data) {
    if (err) {
      logger.warn(err.message);
      return err;
    }
    // remove comments
    data = data.replace(/--.*$/gm, '');
    // remove newlines
    data = data.replace(/\n/gm, '');
    // split the queries
    const queries = data.split(/;/g);

    queries.forEach((query) => {

      pool.getConnection(function (err, connection) {
        if (err) {
          const newerr = new Error('Could not establish connection to database.');
          newerr.cause = err;
          return callback(newerr, null);
        }
        logger.debug(`Connected to DB with id ${connection.threadId}`);

        connection.query(query, function (err, rows) {
          connection.release();
          if (err) {
            const newerr = new Error(`Could not execute query: ${query}.`);
            newerr.cause = err;
            return callback(newerr, null);
          }
          return callback(null, rows);
        });

        connection.on('error', function (err) {
          const newerr = new Error('Error connecting to database.');
          newerr.cause = err;
          return callback(newerr, null);
        });

      }); // end pool.getConnection

    }); // queries.forEach

  }); // end fs.readFile

}

function get_entry(username, servicekey, callback) {
  pool.getConnection(function(err, connection){
    if (err) {
      const newerr = new Error('Could not establish connection to database.');
      newerr.cause = err;
      return callback(newerr, null);
    }
    logger.debug(`Connected to DB with id ${connection.threadId}`);

    // do the query
    connection.query('select * from data where username = ? and servicekey = ?', [username, servicekey], function(err,rows) {
      connection.release();
      if(err) {
        const newerr = new Error(`Could not get entry for user ${username}, and servicekey ${servicekey} from database.`);
        newerr.cause = err;
        return callback(newerr, null);
      }
      return callback(null, rows);
    });

    connection.on('error', function(err) {
      const newerr = new Error('Error connecting to database.');
      newerr.cause = err;
      return callback(newerr, null);
    });
  });
}

// close database connection on exit
nodeCleanup(function (exitCode, signal) {
  // release resources here before node exits
  logger.debug(`About to exit with code: ${signal}`);
  pool.end(function (err) {
    // all connections in the pool have ended
  });
  logger.debug('Closed userdata database connection.');
});

