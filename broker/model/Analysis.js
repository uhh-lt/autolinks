'use strict';

/* imports */
const
  Annotation = require('./Annotation');

module.exports = Analysis;

Analysis.prototype.text = '';
Analysis.prototype.source = 'unk';
Analysis.prototype.lang = 'en';
Analysis.prototype.availableTypes = [];
Analysis.prototype.annotations = [];

/**
 * @constructor
 */
function Analysis() {
  /*
   * The analysis object
   */
  this.availableTypes = [ ];
  this.annotations = [ ];
}

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Annotation}
 */
Analysis.prototype.deepAssign = function(obj) {
  this.assign(obj);
  this.annotations = this.annotations.map(anno_obj => {
    if(anno_obj instanceof Annotation) {
      return anno_obj;
    }
    return new Annotation().deepAssign(anno_obj);
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


