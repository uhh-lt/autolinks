'use strict';

/* imports */
const
  DOffset = require('./DOffset'),
  Offset = require('./Offset'),
  Analysis = require('./Analysis'),
  Exception = require('./Exception');

module.exports.model = ServiceParameter;

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
  if(!(this.focus instanceof DOffset.model)){
    this.focus = new DOffset.model().deepAssign(this.focus);
  }
  if(!(this.context instanceof Analysis.model)){
    this.context = new Analysis.model().deepAssign(this.context);
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
    return callback(Exception.model.fromError(null, 'No data object provided.', {data: service_parameter}), null);
  }
  if(!service_parameter.focus) {
    return callback(Exception.model.fromError(null, 'Parameter \'focus\' (DOffset) missing.', {data: service_parameter}), null);
  }
  if(!service_parameter.context) {
    return callback(Exception.model.fromError(null, 'Parameter \'context\' (Analysis) missing.', {data: service_parameter}), null);
  }

  try {
    const sp = new ServiceParameter().deepAssign(service_parameter);
    return callback(null, sp);
  } catch(err) {
    return callback(Exception.model.fromError(err, 'Casting ServiceParameter failed.', {data: service_parameter}), null);
  }

};

/**
 * Get a service parameter object from a request
 * @param req
 * @return {Promise} of a {ServiceParameter}
 */
ServiceParameter.fromRequestPromise = function(req) {
  return new Promise((resolve, reject) => {
    const service_parameter = req.swagger.params.data.value;
    if(!service_parameter) {
      return reject(Exception.model.fromError(null, 'No data object provided.', {data: service_parameter}));
    }
    if(!service_parameter.focus) {
      return reject(Exception.model.fromError(null, 'Parameter \'focus\' (DOffset) missing.', {data: service_parameter}));
    }
    if(!service_parameter.context) {
      return reject(Exception.model.fromError(null, 'Parameter \'context\' (Analysis) missing.', {data: service_parameter}));
    }

    try {
      const sp = new ServiceParameter().deepAssign(service_parameter);
      return resolve(sp);
    } catch(err) {
      return reject(Exception.model.fromError(err, 'Casting ServiceParameter failed.', {data: service_parameter}));
    }
  });
};

/**
 * Create a simple service parameter object that uses the whole given text as focus object
 * @param text
 * @return {ServiceParameter}
 */
ServiceParameter.simpleText = function(text){
  const sp = new ServiceParameter();
  sp.context = Analysis.model.fromText(text);
  sp.focus = new DOffset.model([new Offset.model(0,text.length)]);
  return sp;
};