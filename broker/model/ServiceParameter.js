'use strict';

/* imports */
const
  DOffset = require('./DOffset'),
  Offset = require('./Offset'),
  Analysis = require('./Analysis'),
  Exception = require('./Exception');

module.exports = ServiceParameter;

ServiceParameter.prototype.focus = null;
ServiceParameter.prototype.context = null;

/**
 * @constructor
 */
function ServiceParameter() {
  /*
   * The ServiceParameter object
   */
}

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {ServiceParameter}
 */
ServiceParameter.prototype.deepAssign = function(obj) {
  this.assign(obj);
  if(!(this.focus instanceof DOffset)){
    this.focus = new DOffset().deepAssign(this.focus);
  }
  if(!(this.context instanceof Analysis)){
    this.context = new Analysis().deepAssign(this.context);
  }
  return this;
};

/**
 *
 * @param obj
 */
ServiceParameter.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

/**
 * Get a service parameter object from a request
 * @param req
 * @param callback
 * @return {*}
 */
ServiceParameter.fromRequest = function(req, callback) {

  const service_parameter = req.swagger.params.data.value;
  if(!service_parameter) {
    return callback(Exception.fromError(null, 'No data object provided.', {data: service_parameter}), null);
  }
  if(!service_parameter.focus) {
    return callback(Exception.fromError(null, 'Parameter \'focus\' (DOffset) missing.', {data: service_parameter}), null);
  }
  if(!service_parameter.context) {
    return callback(Exception.fromError(null, 'Parameter \'context\' (Analysis) missing.', {data: service_parameter}), null);
  }

  try {
    const sp = new ServiceParameter().deepAssign(service_parameter);
    return callback(null, sp);
  } catch(err) {
    return callback(Exception.fromError(err, 'Casting ServiceParameter failed.', {data: service_parameter}), null);
  }

};

/**
 * Create a simple service parameter object that uses the whole given text as focus object
 * @param text
 * @return {ServiceParameter}
 */
ServiceParameter.simpleText = function(text){
  const sp = new ServiceParameter();
  sp.context = Analysis.fromText(text);
  sp.focus = new DOffset([new Offset(0,text.length)]);
  return sp;
};