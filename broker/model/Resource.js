'use strict';

/* imports */
const
  Triple = require('./Triple');

module.exports = Resource;

Resource.prototype.rid = -1;
Resource.prototype.cid = -1;
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
    this.metadata = {};
  }
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
      return new Triple().deepAssign(this.value);
    }
    // else isStringResource
    return this.value;
  };
  this.value = castvalue();
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
