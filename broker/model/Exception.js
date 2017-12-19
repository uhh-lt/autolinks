'use strict';

module.exports = Exception;

Exception.prototype.type = null;
Exception.prototype.message = null;
Exception.prototype.cause = null;

/**
 * @constructor
 */
function Exception() {
  /*
   * The Exception object
   */
}


/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Exception}
 */
Exception.prototype.deepAssign = function(obj) {
  return this.assign(obj);
};

/**
 *
 * @param obj
 * @returns {Exception}
 */
Exception.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};


