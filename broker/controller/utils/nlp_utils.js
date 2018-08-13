'use strict';

// imports
const
  Exception = require('../../model/Exception').model,
  storage = require('../storage_wrapper'),
  Resource = require('../../model/Resource').model,
  DOffset = require('../../model/DOffset').model,
  Offset = require('../../model/Offset').model,
  logger = require('../log')(module);

module.exports.getAnnotationResourcesDoc = function(uid, did, focus) {
  return storage.promisedGetDocumentAnalysis(uid, did)
    .then(
      ana => this.getAnnotationResources(uid, did, ana, focus),
      err => Exception.fromError(err, `Could not get analysis object for document ${did}.`)
    );
};

module.exports.getAnnotationResources = function(uid, did, analysis, focus){
  let empty_focus = !!focus ? !Object.keys( focus ).length : true;
  empty_focus = empty_focus || focus.maxlength() === 0;
  let overlappingAnnotations = null;

  if(empty_focus){
    logger.info('Interpreting all annotations.');
    overlappingAnnotations = analysis.annotations;
  }else{
    logger.info('Computing overlap.');
    overlappingAnnotations = analysis.getAnnotationsWithinDOffset(focus);
  }
  logger.info(`Found ${overlappingAnnotations.length} annotations to interpret.`);
  console.time(`Interpreting`);

  const annotationResourcePromises = [...overlappingAnnotations].map(anno => {
    const anno_text = anno.doffset.getText(analysis.text);
    return this.getAnnotationResource(uid, did, anno, anno_text, empty_focus);
  });

  return Promise.all(annotationResourcePromises)
    .then(annotationResources => {
      annotationResources = annotationResources.filter(r => r !== null);
      logger.info(`Finished interpretation of ${annotationResources.length} annotation resources.`);
      console.timeEnd(`Interpreting`);
      if(empty_focus){
        return annotationResources.length;
      }else{
        return annotationResources;
      }
    });
};

module.exports.getAnnotationResource = function(uid, did, anno, text, skipsources){
  const resource_key = `annotation::${anno.analyzer}:${anno.type}:${did}:${anno.begin()}:${anno.end()}`;
  const resource_storage_key = resource_key;
  const raw_annotation_resource = new Resource(null, resource_key, null, {
    label : text
  });
  Object.assign(raw_annotation_resource.metadata, anno.properties);
  return get_or_add_resource(uid, resource_storage_key, raw_annotation_resource, did, skipsources)
    .then(
      r => r,
      err => {
        Exception.fromError(err, `Failed to add annotation resource ${raw_annotation_resource} with storage key ${resource_storage_key} for user ${uid}.`)
          .log(logger, logger.warn);
        return null;
      });
};


function get_or_add_resource(userid, storagekey, rawresource, did, skipsources) {
  return storage.promisedWrite(userid, storagekey, rawresource, skipsources)
    .then(r => storage.linkResourceToDocument(userid, r.rid, did).then(_ => r));
}
