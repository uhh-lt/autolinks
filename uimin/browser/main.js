'use strict';

/**
 *
 * THIS FILE WILL BE BUNDLED BY BROWSERIFY INTO bundle.js
 *
 */

const
  Exception = require('../../broker/model/Exception'),
  jq = require('jquery');

window.$ = jq;

window.init = function () {
  // window.alert(window.location.href);
  // window.alert($("#head").text() + " within index.js");
  console.log('Initializing autlinks minimized frontend.');
};

