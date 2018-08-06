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
  const empty_focus = !!focus ? !Object.keys( focus ).length : true;
  let overlappingAnnotations = null;
  if(empty_focus){
    overlappingAnnotations = analysis.getAnnotationsWithinDOffset(new DOffset([new Offset(0, analysis.text.length)]));
  }else{
    overlappingAnnotations = analysis.getAnnotationsWithinDOffset(focus);
  }

  const annotationResourcePromises = [...overlappingAnnotations].map(anno => {
    const anno_text = anno.doffset.getText(analysis.text);
    return this.getAnnotationResource(uid, did, anno, anno_text, true);
  });

  return Promise.all(annotationResourcePromises)
    .then(annotationResources => {
      let focustext = analysis.source;
      let focus_storage_key = `annotations::${did}:0:${analysis.text.length}`;
      if(!empty_focus){
        focustext = focus.getText(analysis.text);
        focus_storage_key = `annotations::${did}:${focus.begin()}:${focus.end()}`;
      }

      const raw_focus_resource = new Resource(null, annotationResources, null, { label: focustext });
      return get_or_add_resource(uid, focus_storage_key, raw_focus_resource, empty_focus);
    });
};

module.exports.getAnnotationResource = function(uid, did, anno, text, skipsources){
  const resource_key = `annotation::${anno.analyzer}:${anno.type}:${did}:${anno.begin()}:${anno.end()}`;
  const resource_storage_key = resource_key;
  const raw_annotation_resource = new Resource(null, resource_key, null, {
    label : text
  });
  Object.assign(raw_annotation_resource.metadata, anno.properties);
  return get_or_add_resource(uid, resource_storage_key, raw_annotation_resource, skipsources);
};


function get_or_add_resource(userid, storagekey, rawresource, skipsources) {
  return storage.promisedRead(userid, storagekey, skipsources).then(resource => {
    if (resource) {
      return resource;
    }
    // else create resource
    return storage.promisedWrite(userid, storagekey, rawresource, skipsources);
  });
}
