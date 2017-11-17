'use strict';

const winston = require('winston');


var getLabel = function(callingModule) {
  var parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
};


module.exports = function(callingModule){

  let label = getLabel(callingModule);

  return new (winston.Logger)({

    transports: [

      new (winston.transports.Console)({
        level: 'info',
        prettyPrint: true,
        colorize: true,
        timestamp: true,
        label: label
      }),

      new (winston.transports.File)({
        level: 'debug',
        filename: 'server.log',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        timestamp: true,
        json: false,
        label: label
      })

    ]

  });
}