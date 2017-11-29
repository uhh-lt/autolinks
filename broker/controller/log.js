'use strict';

const winston = require('winston');

const loglevel = process.env.LOGLEVEL || 'info';

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
}


module.exports = function(callingModule) {

  let aModulesLabel = getLabel(callingModule);

  return new (winston.Logger)({

    transports: [

      new (winston.transports.Console)({
        level: loglevel,
        prettyPrint: true,
        colorize: true,
        timestamp: true,
        label: aModulesLabel,
      }),

      new (winston.transports.File)({
        level: 'debug',
        filename: 'data/server.log', // uses the base path
        handleExceptions: true,
        humanReadableUnhandledException: true,
        timestamp: true,
        json: false,
        prettyPrint: false,
        label: aModulesLabel,
      })

    ]

  });

};