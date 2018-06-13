'use strict';

const
  Exception = require('../../../../broker/model/Exception').model,
  Triple = require('../../../../broker/model/Triple').model,
  Resource = require('../../../../broker/model/Resource').model,
  logger = require('../../../../broker/controller/log')(module);

module.exports = function(index) {
  if( /data/.test(index) ) {
    logger.info(`Using wikidata querybuilder for index '${index}'.`);
    return wikidata;
  }
  if( /wikt/.test(index) ) {
    logger.info(`Using wiktionary querybuilder for index '${index}'.`);
    return wiktionary;
  }
  if( /wiki/.test(index) ) {
    logger.info(`Using wikipedia querybuilder for index '${index}'.`);
    return wikipedia;
  }
  logger.info(`No proper index type found, using generic querybuilder for index '${index}'.`);
  return generic;
};

/**
 *
 */
const generic = function(text, offset, limit) {
  const q =
    {
      "query":
        {
          "query_string":
            {
              "query": text,
              "default_operator": "AND"
            }
        },
      "from": offset,
      "size": limit
    };
  return q;
};
/**
 *
 */
generic.transformHit = function(text, hit, i) {
  const hitresource = new Resource(null, `${hit._index}/${hit._type}/${hit._id}?version=${hit._version}`, null, {
    id: hit._id,
    hit: i,
    type: hit._type,
    index: hit._index,
    score: hit._score,
  });
  return hitresource;
};

/**
 *
 */
const wikipedia = function(text, offset, limit) {
  const q =
    {
      "query":
        {
          "query_string":
            {
              "query": text,
              "fields":
                [
                  "title.keyword^5",
                  "redirect.title.keyword^4",
                  "title.plain^3",
                  "opening_text.plain^2",
                  "all",
                  "all_near_match"
                ],
              "default_operator": "AND"
            }
        },
      "_source":
        [
          "title",
          "category",
          "redirect",
          "opening_text",
          "wikibase_item"
        ],
      "from": offset,
      "size": limit
    };
  return q;
};
/**
 *
 */
wikipedia.transformHit = function(text, hit, i) {

  const hitresource = new Resource(null, `${hit._index}/${hit._type}/${hit._id}`, null, {
    id: hit._id,
    label: hit._source.title,
    hit: i,
    index: hit._index,
    score: hit._score,
    language: hit._source.language,
    www: `https://${hit._source.language}.wikipedia.org/?curid=${hit._id}`,
    wikibase: `https://www.wikidata.org/wiki/${hit._source.wikibase_item}`,
    description: hit._source.opening_text,
  });

  const redirectingResources = hit._source.redirect.map(r =>  Resource.fromValue(r.title));
  const redirectingTriple = Resource.fromValue(new Triple(redirectingResources, Resource.fromValue('redirects'), hitresource));

  const categoryResources = hit._source.category.map(c => new Resource(null, c, null, {
    www: `https://${hit._source.language}.wikipedia.org/wiki/category:${encodeURI(c)}`,
  }));
  const categoryTriple = Resource.fromValue(new Triple(hitresource, Resource.fromValue('appears in'), categoryResources));

  const containerResource = Resource.fromValue([redirectingTriple, categoryTriple]);

  return containerResource;

};


/**
 *
 */
const wikidata = function(text, offset, limit) {
  new Exception('NotImplemented', 'Method not yet implemented. Returning genericly built query!').log(logger.debug);
  return generic(text, offset, limit);
};
/**
 *
 */
wikidata.transformHit = function(text, hit, i) {
  return generic.transformHit(text, hit, i);
};

/**
 *
 */
const wiktionary = function(text, offset, limit) {
  new Exception('NotImplemented', 'Method not yet implemented. Returning genericly built query!').log(logger.debug);
  return generic(text, offset, limit);
};
/**
 *
 */
wiktionary.transformHit = function(text, hit, i) {
  return generic.transformHit(text, hit, i);
};