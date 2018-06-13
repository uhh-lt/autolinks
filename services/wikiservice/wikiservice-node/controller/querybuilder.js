'use strict';

const
  Exception = require('../../../../broker/model/Exception').model,
  // Triple = require('../../../../broker/model/Triple').model,
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
                  "title.keyword^3",
                  "title.plain^2",
                  "source_text.plain"
                ],
              "default_operator": "AND"
            }
        },
      "_source":
        [
          "title",
          "category",
          "redirect"
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

  const hitresource = new Resource(null, `${hit._index}/${hit._type}/${hit._id}?version=${hit._version}`, null, {
    id: hit._id,
    label: hit._source.title,
    hit: i,
    index: hit._index,
    score: hit._score,
    link: `http://en.wikipedia.org/?curid=${hit._id}`
  });

  const redirectResources = []; // h._source.redirect
  const categoryResources = []; // h._source.category
  return hitresource;

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