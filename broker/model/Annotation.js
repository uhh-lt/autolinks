'use strict';

module.exports = Annotation;

Annotation.prototype.type = null;
Annotation.prototype.properties = {};
Annotation.prototype.analyzer = null;
Annotation.prototype.doffset = [];

/**
 * @constructor
 */
function Annotation() {
  /*
   * The analysis object
   */
  this.properties = {};
  this.doffset = [];
}

