'use strict';

const util = require('../../controller/utils/utils');

async function asyncCall() { // jshint ignore:line
  console.log('calling');
  var result = await util.waitPromise(2000).then(_ => 'resolved'); // jshint ignore:line
  console.log(result);
  // expected output: "resolved"
}

asyncCall();
console.log('called');