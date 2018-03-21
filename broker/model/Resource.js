'use strict';

/* imports */
const
  Triple = require('./Triple');

module.exports.model = Resource;

Resource.prototype.rid = 0;
Resource.prototype.cid = 0;
Resource.prototype.metadata = null;
Resource.prototype.value = null;

/**
 * @constructor
 */
function Resource(rid, value, cid, metadata) {
  this.rid = rid;
  this.value = value;
  this.cid = cid;
  if(!metadata) {
    metadata = {};
  }
  this.metadata = metadata;
}

Resource.prototype.resolve = function(){
  console.log('NOT YET IMPLEMENTED');
};

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Resource}
 */
Resource.prototype.deepAssign = function(obj) {
  this.assign(obj);
  const castvalue = () => {
    if(this.isListResource()) {
      return this.value.map(resourceObj => new Resource().deepAssign(resourceObj));
    }
    if(this.isTripleResource()){
      return new Triple.model().deepAssign(this.value);
    }
    // else isStringResource
    return this.value;
  };
  this.value = castvalue();
  return this;
};

/**
 *
 * @param obj
 * @returns {Triple}
 */
Resource.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

Resource.asResource = function(obj){
  if(obj instanceof Resource){
    return obj;
  }
  return new Resource().assign(obj);
};

Resource.prototype.isListResource = function(){
  return Array.isArray(this.value);
};

Resource.prototype.isTripleResource = function(){
  return this.value === Object(this.value) && !this.isListResource();
};

Resource.prototype.isStringResource = function(){
  return !(this.isListResource() || this.isTripleResource());
};

Resource.prototype.fromString = function(string) {
    let r = new Resource();
    r.value = string;
    return r;
};