'use strict';

const
  fetcher = require('node-fetch'),
  Triple = require('../../../broker/model/Triple').model,
  Resource = require('../../../broker/model/Resource').model,
  log = require('../../../broker/controller/log')(module);

const query = 'B-cell';

function findhit(hits, uri) {
  return hits.findIndex(hit => hit.concepturi === uri);
}

function safeget(p, o, def=null) {
  return p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : def, o);
}

module.exports.search = function(query) {
  return Promise.resolve(query)
    .then(() => {
      const url = 'https://www.wikidata.org/w/api.php?format=json&limit=2&action=wbsearchentities&language=en&type=item&search=' + encodeURIComponent( query );
      return fetcher( url, { headers: { 'Accept': 'application/json' } } );
    })
    .then( body => body.json() ).then( json => {
    const { searchinfo, search } = json;
    log.debug(`Info for query '${query}': ${JSON.stringify(searchinfo)}`);
    return search;
  }).catch(e => {
    log.error(e);
    return null;
  });
};

module.exports.query_sparql = function(hits) {
  return Promise.resolve(hits)
    .then(() => {
      const concepts = hits.map( result => result.id );
      log.debug(`found ${concepts}`);
      const wdconcepts = concepts.map(concept => `wd:${concept}`).join(' ');
      const endpointUrl = 'https://query.wikidata.org/sparql?query=',
        sparqlQuery = `
SELECT DISTINCT
  ?item ?itemLabel ?itemDescription ?article
  (GROUP_CONCAT(DISTINCT(?akaLabel); separator = "|") AS ?aka)
  (GROUP_CONCAT(DISTINCT(?subclassof); separator = "|") AS ?classes)
  (GROUP_CONCAT(DISTINCT(?instanceof); separator = "|") AS ?types)
  (GROUP_CONCAT(DISTINCT(?subclassofLabel); separator = "|") AS ?classlabels)
  (GROUP_CONCAT(DISTINCT(?instanceofLabel); separator = "|") AS ?typelabels)
WHERE {
  VALUES ?item { ${wdconcepts} } #initialize ?item with the Wikidata item that are hits from the query above 
  ?item wdt:P279 ?subclassof .
  ?item wdt:P31 ?instanceof .
  OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://en.wikipedia.org/> . }
  OPTIONAL { ?item wdt:P646 ?fid. }
  OPTIONAL { ?item skos:altLabel ?_aka }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "en".
    ?item rdfs:label ?itemLabel; schema:description ?itemDescription.
    ?_aka rdfs:label ?akaLabel.
    ?subclassof rdfs:label ?subclassofLabel.
    ?instanceof rdfs:label ?instanceofLabel.
  }
}
GROUP BY ?item ?itemLabel ?itemDescription ?article`, fullUrl = endpointUrl + encodeURIComponent( sparqlQuery );
      return fetcher( fullUrl, { headers: { 'Accept': 'application/sparql-results+json' } } );
    })
    .then( body => body.json() )
    .then( json => {
      const { head: { vars }, results } = json;
      // prepare results
      const sortedidxs = results.bindings.map(result => findhit(hits, result.item.value));
      const resourcelist = sortedidxs.map(i => {
        const result = results.bindings[i];
        const item = safeget(['item','value'], result);
        log.debug(item);

          // ?item ?itemLabel ?itemDescription ?fid ?article ?instanceof ?subclassof ?instanceofLabel ?subclassofLabel ?aka
          // ?types
          // ?classes

        const itemresource = Resource.fromValue( safeget(['aka', 'value'], result, []).split('|').map(s => Resource.fromValue(s)));
        itemresource.metadata = { label:safeget(['itemLabel', 'value'], result, item), description:safeget(['item','itemDescription'], result, '') };

        const classes = safeget(['classes', 'value'], result, []).split('|');
        const classlabels = safeget(['classlabels', 'value'], result, []).split('|');
        const classResources = classes.map((c,i) => Resource.fromValue(c, {label:classlabels[i]}));

        const types = safeget(['types', 'value'], result, []).split('|');
        const typelabels = safeget(['typelabels', 'value'], result, []).split('|');
        const typeResources = types.map((t,i) => Resource.fromValue(t, {label:typelabels[i]}));

        // create class triples
        const typetriples = typeResources.map(r => Resource.fromValue(new Triple(itemresource, 'is instance of', r)));
        const classtriples = classResources.map(r => Resource.fromValue(new Triple(itemresource, 'is subclass of', r)));

        const triples = [ Resource.fromValue(new Triple(itemresource, Resource.fromValue("has article"), Resource.fromValue(safeget(['article', 'value'], result)))) ]
          .concat(typetriples)
          .concat(classtriples);

        return triples;
      });
      const flatResourcelist = resourcelist.reduce((x,y) => x.concat(y), []);
      return Resource.fromValue(flatResourcelist, { label: `Wikidata '${query}'`  });
    })
    .catch(e => {
      log.error(e);
      return Resource.fromValue([], { label: `Wikidata '${query}'.` });
    });
};