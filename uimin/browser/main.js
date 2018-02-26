'use strict';

/**
 *
 * THIS FILE WILL BE BUNDLED BY BROWSERIFY INTO bundle.js
 *
 */

const jq = require('jquery');

window.$ = jq;

window.init = function () {
  // window.alert(window.location.href);
  // window.alert($("#head").text() + " within index.js");
  console.log('Initializing autlinks minimized frontend.');
};

window.renderServices = function() {
  const broker = jq('#BROKER_URL').val() || 'http://localhost:10000';
  console.log(`Broker url: '${broker}/service/listServices'`);
  const html_list = jq('#service_list');
  html_list.empty();
  jq.getJSON(`${broker}/service/listServices`, function( data ) {
    jq.each(data, function(i, val) {
      console.log(`${i}, ${val}`);
      const html_service = `<li id='service_${i}'>${val.name}</li>`;
      html_list.append(html_service);
    });
  });
};
