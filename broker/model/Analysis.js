'use strict';

/* imports */
const
  logger = require('../controller/log')(module),
  Annotation = require('./Annotation');

module.exports.model = Analysis;

Analysis.prototype.text = '';
Analysis.prototype.source = 'unk';
Analysis.prototype.lang = 'en';
Analysis.prototype.annotations = [];

/**
 * @constructor
 */
function Analysis() {
  /*
   * The analysis object
   */
  this.annotations = [ ];
}

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Analysis}
 */
Analysis.prototype.deepAssign = function(obj) {
  this.assign(obj);
  this.annotations = this.annotations.map(anno_obj => {
    if(anno_obj instanceof Annotation.model) {
      return anno_obj;
    }
    return new Annotation.model().deepAssign(anno_obj);
  });
  return this;
};

/**
 *
 * @param obj
 */
Analysis.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

/**
 *
 * @param text
 * @return {Analysis}
 */
Analysis.fromText = function(text){
  const analysis = new Analysis();
  analysis.text = text;
  return analysis;
};

/**
 *
 * @param {Array}
 */
Analysis.prototype.addAnnotations = function(annotations) {
  this.annotations = this.annotations.concat(annotations);
};

/**
 * @return {Set}
 */
Analysis.prototype.getAvailableTypes = function() {
  return new Set(this.annotations.map(a => a.type));
};

Analysis.prototype.prepareIndex = function(rebuild) {
  if(this.annotation_index) {
    // index exists already
    logger.debug(`Index for '${this.source}' exists already.`);
    if(!rebuild){
      return;
    }
    // rebuild
  }

  logger.debug(`Building index for '${this.source}'.`);
  this.annotation_index = {};
  this.annotations.forEach(anno => {
    anno.doffset.offsets.forEach(offset => {
      let i = offset.from;
      for(; i < (offset.from + offset.length); i++) {
        if(!this.annotation_index[i]) {
          this.annotation_index[i] = [];
        }
        this.annotation_index[i].push(anno);
      }
    });
  });

};

/**
 *
 * Get all annotations that exists at the given offsets. This might be partially overlapping, or fully contained
 *
 * @param {Offset}
 * @return {Set<Annotation>}
 */
Analysis.prototype.getAnnotationsWithinOffset = function(offset) {
  if(!this.annotation_index) {
    this.prepareIndex();
  }
  const annos = new Set();
  let i = offset.from;
  for(; i < (offset.from + offset.length); i++) {
    const annos_at_i = this.annotation_index[i];
    if(!annos_at_i) {
      continue;
    }
    for(let anno of annos_at_i){
      annos.add(anno);
    }
  }
  return annos;
};

/**
 *
 * Get exact annotations within the doffset, i.e. gaps in the doffset are not considered
 *
 * If strict is given, return only annotations that start and end with the given offset
 *
 * TODO: another option would be to get the minimum start index and maximum end index and then get all annotations within (at the moment we don't need this)
 *
 * @param {DOffset}
 * @param strict
 * @return {Set<Annotation>}
 */
Analysis.prototype.getAnnotationsWithinDOffset = function(doffset, strict = true) {
  const annotations = new Set();
  doffset.offsets.forEach(offset => this.getAnnotationsWithinOffset(offset).forEach(anno => annotations.add(anno)));

  if(strict) {
    // logger.debug('Filter strict.');
    // filter
    annotations.forEach(anno => {
      if(!(anno.begin() >= doffset.begin() && anno.end() <= doffset.end())){
        annotations.delete(anno);
      }
    });
  }
  return annotations;
};



