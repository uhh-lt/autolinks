'use strict';

const
  _ = require('lodash'),
  elasticsearch = require('elasticsearch'),
  Triple = require('../../../../broker/model/Triple').model,
  Resource = require('../../../../broker/model/Resource').model,
  logger = require('../../../../broker/controller/log')(module);

const esIndices = [];

let esClient;

/**
 * init es client
 * @param callback = function(err)
 */
module.exports.init = function (callback) {

  const es_urls =  (process.env.ELASTICSEARCH_URLS || 'http://elasticsearch:9200').split(/,/);
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  const es_version = process.env.ELASTICSEARCH_VERSION || '5.5';
  logger.info(`Using the follwing elasticsearch nodes: '${JSON.stringify(es_urls)}'`);

  (process.env.ELASTICSEARCH_INDICES || '')
    .split(/,/)
    .map(x => x.trim())
    .filter(x => x.length > 0)
    .forEach(x => esIndices.push(x));
  logger.info(`Using the follwing elasticsearch indices: '${JSON.stringify(esIndices)}'`);

  try {
    esClient = new elasticsearch.Client({
      hosts: es_urls,
      apiVersion: es_version,
      // sniffOnStart: true,
      // sniffInterval: 20000,
    });
  } catch(err){
    return callback(err);
  }

  callback(null);

};

/**
 *
 * @param callback
 */
module.exports.findWikiIndices = function(callback) {
  // _cat/indices?index=*wik*
  callback(new Error('NOT YET IMPLEMENTED'));
};

/**
 *
 * @param callback = function(err)
 */
module.exports.ping = function(callback){
  esClient.ping({
    requestTimeout: 30000,
  }, callback);
};

/**
 *
 * Perform a query for each index and return the results as a ListResource
 *
 * @param text
 * @return {Promise} of a Resource
 */
module.exports.search = function(text) {

  // Promise.resolve(combined);

  // module.exports.query(esIndices[i], text, 0, 2);

  return Promise.all(
    esIndices.map(esindex => {
      return this.query(esindex, text, 0, 2)
        .then(esresult => this.transformSearchResult(esindex, text, esresult));
    })).then(indexresources => {
      indexresources.push(new Resource (null, text));
      return new Resource(null, indexresources);
    });
};

module.exports.transformSearchResult = function(esindex, text, esresult) {
  return Promise.all(
    esresult.hits.hits.map((hit, i) => this.transformHit(text, hit, i+1))
  ).then(
    hitresources => new Resource(null, hitresources, null, { label: esindex, totalhits: esresult.hits.total })
  );
};

module.exports.transformHit = function(text, hit, i) {
  return Promise.resolve(hit)
    .then(hit => {
      const hitresource = new Resource(null, hit._id, null, {
        id: hit._id,
        label: hit._source.title,
        hit: i,
        index: hit._index,
        score: hit._score,
      });

      const redirectResources = []; // h._source.redirect
      const categoryResources = []; // h._source.category
      return hitresource;
    });

  // provide a url:
  // http://en.wikipedia.org/?curid=18630637
  // This is the shortest form, others are also possible:
  // http://en.wikipedia.org/wiki?curid=18630637

  // // for each hit create a triple
  // return _(searchResult.hits.hits)
  //   .map(h =>
  //     new Resource(null,
  //       new Triple(
  //           new Resource(null,text),
  //           new Resource(null, [
  //             new Resource(null, new Triple(
  //                 new Resource(null, "appears_in"),
  //                 new Resource(null, "has_score"),
  //                 new Resource(null, h._score)
  //             )),
  //             new Resource(null, new Triple(
  //                 new Resource(null, "appears_in"),
  //                 new Resource(null, "has_index"),
  //                 new Resource(null, h._index)
  //             ))
  //           ]),
  //           new Resource(null, [
  //             new Resource(null, new Triple(
  //                 new Resource(null, h._id),
  //                 new Resource(null, "has_title"),
  //                 new Resource(null, h._source.title)
  //             ))
  //             ]
  //             .concat(
  //               _(h._source.category).map(c =>
  //                   new Resource(null, new Triple(
  //                       new Resource(null, h._id),
  //                       new Resource(null, "has_category"),
  //                       new Resource(null, c)
  //                   ))
  //               ).value()
  //             )
  //             .concat(
  //               _(h._source.redirect).map(r =>
  //                   new Triple(
  //                       h._id,
  //                       'has_redirect',
  //                       r.title
  //                   )
  //               ).value()
  //             )
  //           )
  //         )
  //       )
  //     ).value();
};

/**
 *
 * @param callback = function(err)
 */
module.exports.close = function(callback){
  esClient.close();
  callback(null);
};

/**
 *
 * @param index
 * @param type
 * @param id
 * @param callback
 */
module.exports.get = function(index, type, id, callback){
  esClient.get({
    index: index,
    type: type,
    id: id
  }, callback);
};


/**
 * @param index
 * @param text
 * @param offset from
 * @param limit limit
 */
module.exports.query = function(index, text, offset, limit){
  // define the es query
  const query = { query_string: { query: `title:(${text})` } };
  // const query = { term : { title : text } };
  const queryBody = {
    query : query,
    from : offset,
    size : limit,
    _source: ['title', 'category', 'redirect']
  };
  logger.debug('Query: ', queryBody);

  return esClient.search({
    index: index,
    body: queryBody
  }).then(
    result => {
      logger.debug(`Found ${result.hits.total} hits for '${index}', returning ${limit}.`);
      return result;
    }
  );
};