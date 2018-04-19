'use strict';

// imports
const
  _ = require('lodash'),
  Exception = require('../../model/Exception').model,
  storage = require('../storage_wrapper'),
  Resource = require('../Resource').model,
  logger = require('../log')(module)
;

module.exports.getAnnotationResources = function(uid, analysis, focus){
  const focustext = focus.getText(analysis.text);
  const focus_storage_key = `annotation::${analysis.source}::${focus.begin()}:${focustext}`;
  const overlappingAnnotations = analysis.getAnnotationsWithinDOffset(focus);

  const annotationResourcePromises = overlappingAnnotations.map(anno => {
    const anno_text = anno.doffset.getText(analysis.text);
    const resource_key = `annotation::${anno_text}:${anno.analyzer}:${anno.type}`;
    const resource_storage_key = `annotation::${analysis.source}:${anno.begin()}:${anno_text}:${anno.analyzer}:${anno.type}`;
    const raw_annotation_resource = new Resource(null, resource_key, null, {
      label : anno_text
    });
    Object.assign(raw_annotation_resource.metadata, anno.properties);
    return get_or_add_resource(uid, resource_storage_key, raw_annotation_resource);
  });

  return Promise.all(annotationResourcePromises)
    .then(annotationResources => {
      const raw_focus_resource = new Resource(null, annotationResources, null, { label: focustext });
      return get_or_add_resource(uid, focus_storage_key, raw_focus_resource);
    });
};


function get_or_add_resource(userid, storagekey, rawresource) {
  return storage.promisedRead(userid, storagekey).then(resource => {
    if (resource) {
      return resource;
    }
    // else create resource
    return storage.promisedWrite(userid, storagekey, rawresource);
  });
}
