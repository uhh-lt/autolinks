'use strict';

// requires
const
  fs = require('fs'),
  nodeCleanup = require('node-cleanup'),
  mysql = require('mysql'),
  Exception = require('../../model/Exception'),
  Triple = require('../../model/Triple'),
  logger = require('../log')(module);

// try connectiontring:
const connectionString = process.env.MYSQL || 'mysql://autolinks:autolinks1@mysql/autolinks?debug=false&connectionLimit=100';
const pool = mysql.createPool(connectionString);
// const pool = mysql.createPool({
//   connectionLimit : 100, //important
//   host     : process.env.MYSQLHOST || 'mysql',
//   user     : 'autolinks',
//   password : 'autolinks1',
//   database : 'autolinks',
//   debug    :  false
// });
logger.info(`Using ${pool.config.connectionLimit} connections.`);

module.exports.init = function(callback) {

  // read the script
  fs.readFile('config/storagedb-schema.mysql.sql', 'utf8', function (err,data) {
    if (err) {
      return callback(err);
    }

    // need to load sql script manually

    // remove comments
    data = data.replace(/--.*$/gm, '');
    // remove newlines
    data = data.replace(/\n/gm, '');
    // split the queries
    const queries = data.split(/;/g);

    queries
      .filter(query => query.length > 0)
      .forEach((query) => {

      pool.getConnection(function (err, connection) {
        if (err) {
          return callback(Exception.fromError(err, 'Could not establish connection to database.'), null);
        }
        logger.debug(`Connected to DB with id ${connection.threadId}`);

        connection.query(query, function (err, rows) {
          connection.release();
          if (err) {
            return callback(Exception.fromError(err, `Could not execute query: ${query}.`), null);
          }
          return callback(null, rows);
        });
        connection.on('error', function (err) {
          return callback(Exception.fromError(err, 'Error connecting to database.'), null);
        });

      }); // end pool.getConnection

    }); // queries.forEach

  }); // end fs.readFile

};

module.exports.read = function(username, storagekey, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};

module.exports.write = function(username, storagekey, triples, callback) {
  triples.forEach(triple => {
    const t = Triple.asTriple(triple);
    // save
    // triple.subject;
    // triple.object;
    // triple.predicate


    if(Array.isArray(triple)){

    } else {

    }

  });

  return callback(new Exception('NOT YET IMPLEMENTED'));
};

function saveResource(resource, callback) {
  pool.getConnection(function(err, connection){
    if (err) {
      return callback(Exception.fromError(err, 'Could not establish connection to database.', {resource: resource}), null);
    }
    logger.debug(`Connected to DB with id ${connection.threadId}`);

    // do the query
    connection.query('insert into resources() where resource = ?', [resource], function(err,rows) {
      connection.release();
      if(err) {
        return callback(Exception.fromError(err, 'Could not query database.', {resource: resource}), null);

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

module.exports.info = function(username, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};



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

