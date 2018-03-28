'use strict';

const
    Offset = require('../../model/Offset').model,
    Annotation = require('../../model/Annotation').model,
    Analysis = require('../../model/Analysis').model,
    utils = require('../utils/utils'),
    logger = require('../log')(module),
    request = require('request-promise-native');

const label = utils.getLabel(__filename);

module.exports = {

    init : function(callback) {
        /* nothing to do */
        callback(null);
    },

    findNamedEntities : function(analysis, callbackStart, callbackIter, callbackDone) {
        logger.debug(`Analyzing document: '${analysis.source}'.`);

        // report that we'll start returning entities now
        callbackStart();

        let options = {
            uri: 'http://ctakes-nlp:8080/analyse',
            method: 'POST',
            json: {
                "query": analysis.text
            }
        };

        request(options)
            .then(function (parsedBody) {
                // POST succeeded...
                if(parsedBody.annotations !== null) {
                    parsedBody.annotations.forEach(function(element) {
                        let anno = new Annotation();
                        anno.analyzer = label;
                        anno.type = element.type;
                        anno.doffset.offsets.push(new Offset(element.offset.from, element.offset.to - element.offset.from));
                        anno.properties = element.properties;

                        // return the entity
                        callbackIter(anno);
                    });
                }

                // report that we're done
                callbackDone(null);
            })
            .catch(function (err) {
                // POST failed...
                console.log(err);

                // report that we're done
                callbackDone(err);
            });
    },

    analyze : function(text, contentType, source, callback) {
        const ana = new Analysis();
        ana.text = text;
        ana.source = source;
        logger.info({text: text, contentType: contentType, source: source});

        this.findNamedEntities(ana,
            () => {},
            (anno) => {
                if(anno != null) {
                    logger.debug('Found an annotation:' + anno);
                    ana.annotations.push(anno);
                }
            },
            (err) => {
                callback(err, ana);
            });
    }
};