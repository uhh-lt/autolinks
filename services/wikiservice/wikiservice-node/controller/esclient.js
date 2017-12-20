'use strict';

const
  elasticsearch = require('elasticsearch'),
  logger = require('../../../../broker/controller/log')(module);



let esclient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  try {
    esclient = new elasticsearch.Client({
      hosts: es_urls,
      apiVersion: '5.4',
      sniffOnStart: true,
      sniffInterval: 20000,
    });
  } catch(err){
    return callback(err);
  }
  callback(null);
};

/**
 *
 * @param callback = function(err)
 */
module.exports.ping = function(callback){
  esclient.ping({
    requestTimeout: 30000,
  }, callback);
};

/**
 *
 * @param text
 * @param callback
 */
module.exports.search = function(text, callback){
  callback(new Error('NOT YET IMPLEMENTED'), null);
};

/**
 *
 * @param callback = function(err)
 */
module.exports.close = function(callback){
  esclient.close();
  callback(null);
};


/**
 * @param index
 * @param query
 * @param callback
 */
module.exports.query = function(index, query, callback){
  return callback(new Error('NOT YET IMPLEMENTED'), null);

  // client.search({
  //   index: 'myindex',
  //   body: {
  //     query: {
  //       match: {
  //         title: 'test'
  //       }
  //     },
  //     facets: {
  //       tags: {
  //         terms: {
  //           field: 'tags'
  //         }
  //       }
  //     }
  //   }
  // }, function (error, response) {
  //   // ...
  // });

};