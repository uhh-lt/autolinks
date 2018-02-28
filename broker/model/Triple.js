'use strict';

/* imports */
const
  Resource = require('./Resource');

module.exports.model = Triple;

Triple.prototype.subject = null;
Triple.prototype.predicate = null;
Triple.prototype.object = null;

/**
 * @constructor
 */
function Triple(subject, predicate, object) {
  /*
   * The triple object
   */
  if(subject) {
    this.subject = subject;
  }
  if(predicate) {
    this.predicate = predicate;
  }
  if(object) {
    this.object = object;
  }
}

Triple.prototype.resolve = function(){
  console.log('NOT YET IMPLEMENTED');
};

/**
 *
 * Deep copy from ordinary object
 *
 * @param obj
 * @returns {Triple}
 */
Triple.prototype.deepAssign = function(obj) {
  this.assign(obj);

  this.subject = new Resource.model().deepAssign(this.subject);
  this.predicate = new Resource.model().deepAssign(this.predicate);
  this.object = new Resource.model().deepAssign(this.object);
  return this;
};

/**
 *
 * @param obj
 * @returns {Triple}
 */
Triple.prototype.assign = function(obj) {
  return Object.assign(this, obj);
};

Triple.asTriple = function(obj){
  if(obj instanceof Triple){
    return obj;
  }
  return new Triple().assign(obj);
};



