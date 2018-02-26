'use strict';

/* imports */
const
  DOffset = require('./DOffset');

module.exports.model = Annotation;

Annotation.prototype.type = null;
Annotation.prototype.properties = {};
Annotation.prototype.analyzer = null;
Annotation.prototype.doffset = null;

/**
 * @constructor
 */
function Annotation() {
  /*
   * The analysis object
   */
  this.properties = {};
  this.doffset = new DOffset.model([]);
}

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Annotation}
 */
Annotation.prototype.deepAssign = function(obj) {
  this.assign(obj);
  if(!(this.doffset instanceof DOffset.model)){
    this.doffset = new DOffset.model().deepAssign(this.doffset);
  }
  return this;
};

/**
 *
 * @param obj
 */
Annotation.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};


