'use strict';

// const logger = require('../log')(module);

module.exports = {

  getLabel : function(fname) {
    const parts = fname.split('/');
    const basename = parts.pop();
    return basename.substring(0,basename.lastIndexOf('.'));
  }

};

/*
* This function will not return until (at least)
* the specified number of milliseconds have passed.
* It does a busy-wait loop.
*/
module.exports.pause = function(numberMillis) {
  let now = new Date();
  const exitTime = now.getTime() + numberMillis;
  while (true) {
    now = new Date();
    if (now.getTime() > exitTime){
      return;
    }
  }
};

/*
 * apply the same promise function to each element in an array
 */
module.exports.sequentialPromise = function(items, promisefun) {
  const reducer = (promise, item) =>
    promise.then(res => promisefun(item).then(y => res.push(y) && res));
  return items.reduce(reducer, Promise.resolve([]));
};

/*
 * apply the same promise function to each element in an array
 */
module.exports.allPromise = function(items, promisefun) {
  return Promise.all(items.map(item => promisefun(item)));
};

/*
 * run the promises sequentially and return the results as a list
 */
module.exports.promiseSequential = function(promises) {
  const reducer = (promiseagg, promise) =>
    promiseagg.then(res => promise.then(y => res.push(y) && res));
  return promises.reduce(reducer, Promise.resolve([]));
};

module.exports.waitPromise = function(ms) {
  return new Promise((resolve, reject) => setTimeout(resolve, ms));
};
