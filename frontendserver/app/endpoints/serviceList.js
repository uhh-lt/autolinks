var request = require('request');
﻿var config = require('../../config.json');

module.exports = function getList(app) {

  var options = {
        url: config.apiUrl + 'service/call',
        method: 'GET',
        headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json'
         },
        json: true,
      }

    console.log('serviceList');
    var req = request(options, function (error, response, body) {
      res.send(body);
    });

};
