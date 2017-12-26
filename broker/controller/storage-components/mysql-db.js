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
    const queries = data.split(/\n\n/g);

    queries
      .map(query => query.trim())
      .filter(query => query.length > 0)
      .forEach(query => {
        withConnection(function(err, connection) {
          if(err){
            return callback(err);
          }
          logger.debug(`Connected to DB with id ${connection.threadId}`);
          connection.query({sql: query, multipleStatements: true}, function (err, rows) {
            connection.release();
            if (err) {
              return callback(Exception.fromError(err, `Could not execute query: ${query}.`), null);
            }
            return callback(null, rows);
          });
        }); // end withConnection
      }); // queries.forEach
  }); // end fs.readFile

};

module.exports.read = function(username, storagekey, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};

module.exports.write = function(username, storagekey, triples, callback) {
  triples.forEach(triple => {
    const tripleObj = Triple.asTriple(triple);
    // save
    // triple.subject;
    // triple.object;
    // triple.predicate


    if (Array.isArray(triple)) {

    } else {

    }

  });

  return callback(new Exception('NOT YET IMPLEMENTED'));
};

function saveTriple(triple, callback) {

  withConnection(function(err, connection) {
    if(err){
      return callback(err);
    }
    logger.debug(`Connected to DB with id ${connection.threadId}`);
    // do the query
    connection.query('select add_resource(?)', [resource], function(err,rows) {
      connection.release();
      if(err) {
        return callback(Exception.fromError(err, `Could not add resource '${resource}' database.`, {resource: resource}), null);
      }
      return callback(null, rows.rid);
    });
  });

}

function saveResource(resource, callback) {
  withConnection(function(err, connection) {
    if(err){
      return callback(err);
    }
    logger.debug(`Connected to DB with id ${connection.threadId}`);
    // do the query
    connection.query('select add_resource(?)', [resource], function(err,rows) {
      connection.release();
      if(err) {
        return callback(Exception.fromError(err, `Could not add resource '${resource}' database.`, {resource: resource}), null);
      }
      return callback(null, rows.rid);
    });
  });

}

module.exports.info = function(username, callback) {
  return callback(new Exception('NOT YET IMPLEMENTED'));
};



function get_entry(username, servicekey, callback) {
  withConnection(function(err, connection) {
    if(err){
      return callback(err);
    }
    // do the query
    connection.query('select * from data where username = ? and servicekey = ?', [username, servicekey], function(err,rows) {
      connection.release();
      if(err) {
        return callback(Exception.fromError(err, `Could not get entry for user ${username}, and servicekey ${servicekey} from database.`));
      }
      return callback(null, rows);
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

