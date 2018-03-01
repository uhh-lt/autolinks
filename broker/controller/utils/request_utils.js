'use strict';

/* imports */
const
  Exception = require('../../model/Exception').model,
  request = require('request');

module.exports.promisedRequest = function(requestObj){
  return new Promise((resolve, reject) => {
    request(requestObj, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return reject(Exception.fromError(error, `Request failed.`, {requestObj: requestObj}));
      }
      return resolve({response: response, body: body});
    });
  });
};
