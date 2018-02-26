'use strict';

/* imports */
const
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




