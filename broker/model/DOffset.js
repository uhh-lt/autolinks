'use strict';

/* imports */
const
  Offset = require('./Offset');

module.exports = DOffset;

DOffset.prototype.offsets = [];

/**
 *
 * @param offsets
 * @constructor
 */
function DOffset(offsets) {

  this.offsets = offsets;

}

DOffset.prototype.end = function() {
  throw new Error('not yet implemented');
};

DOffset.prototype.getText = function (text, separator = ' ') {
  return this.offsets.map(o => o.getText(text)).join(separator);
};


/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {DOffset}
 */
DOffset.prototype.deepAssign = function(obj) {
  this.assign(obj);
  this.offsets = this.offsets.map(os_obj => {
    if(os_obj instanceof Offset) {
      return os_obj;
    }
    return new Offset().deepAssign(os_obj);
  });
  return this;
};

/**
 *
 * @param obj
 * @returns {DOffset}
 */
Offset.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

