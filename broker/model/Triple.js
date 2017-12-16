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