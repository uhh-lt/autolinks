'use strict';

const
  path = require('path'),
  winston = require('winston');

const loglevel = process.env.LOGLEVEL || 'info';

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
}

module.exports = function(callingModule) {

  const aModulesLabel = getLabel(callingModule);

  return new (winston.Logger)({

    transports: [

      new (winston.transports.Console)({
        level: loglevel,
        prettyPrint: false,
        colorize: true,
        timestamp: true,
        label: aModulesLabel
      }),

      new (winston.transports.File)({
        level: 'debug',
        maxsize:'10000000',
        maxFiles: 10,
        filename: path.resolve(global.__datadir && path.join(global.__datadir, 'server.log') || 'server.log'),
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