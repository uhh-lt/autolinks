'use strict';

module.exports = Exception;

Exception.prototype.type = null;
Exception.prototype.message = null;
Exception.prototype.cause = null;
Exception.prototype.fields = null;

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
 * @param err
 * @param newMessage
 * @param fields
 * @returns {Exception}
 */
Exception.fromError = function(err, newMessage, fields){
  const ex = new Exception();
  ex.message = newMessage || err.message;
  ex.cause = err;
  ex.cause = {}; // serialize error to normal json object
  Object.getOwnPropertyNames(err).forEach(function (key) {
    ex.cause[key] = this[key];
  }, err);
  ex.fields = fields;
  return ex;
};

/**
 *
 * @param res server response
 * @returns {ServerResponse}
 */
Exception.prototype.handleResponse = function(res){
  res.status(500);
  if(!res._header) {
    res.header('Content-Type', 'application/json; charset=utf-8');
  }
  res.write(JSON.stringify(this));
  return res;
};

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


