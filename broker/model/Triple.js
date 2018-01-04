'use strict';

module.exports = Triple;

Triple.prototype.subject = "";
Triple.prototype.predicate = "";
Triple.prototype.object = "";

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
  const castResource = resource => {
    if(Array.isArray(resource)) {
      return resource.map(tripleObj => {
        if(tripleObj instanceof Triple) {
          return tripleObj;
        }
        return new Triple().deepAssign(tripleObj);
      });
    }
  };
  this.subject = castResource(this.subject);
  this.predicate = castResource(this.predicate);
  this.object = castResource(this.object);
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


