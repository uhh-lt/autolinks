'use strict';

/* imports */
const
  _ = require('lodash'),
  Offset = require('./Offset');

module.exports.model = DOffset;

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
  return _(this.offsets).map(o => o.end()).max();
};

DOffset.prototype.begin = function() {
 return _(this.offsets).map(o => o.from).min();
};

DOffset.prototype.maxlength = function() {
  const start = this.begin();
  const end = this.end();
  return end - start;
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
    if(os_obj instanceof Offset.model) {
      return os_obj;
    }
    return new Offset.model().deepAssign(os_obj);
  });
  return this;
};

/**
 *
 * @param obj
 * @returns {DOffset}
 */
DOffset.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

