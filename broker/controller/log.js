'use strict';

const winston = require('winston');

const loglevel = process.env.LOGLEVEL || 'info';

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
}


module.exports = function(callingModule){

  let label = getLabel(callingModule);

  return new (winston.Logger)({

    transports: [

      new (winston.transports.Console)({
        level: loglevel,
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