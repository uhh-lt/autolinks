'use strict';

const
  path = require('path'),
  winston = require('winston');

const loglevel = process.env.LOGLEVEL || 'info';

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
}

const myLogFormatter = winston.format.printf(info => {
  let colorcode = '';
  let resetcolorcode = '';
  const colorize = info.level.startsWith('\u001b[');
  if(colorize) {
    colorcode = info.level.substring(0, info.level.search('m') + 1);
    resetcolorcode = '\u001b[0;39m';
  }
  return `${info.level} ${colorcode}${info.timestamp}${resetcolorcode} ${colorcode}[${info.label}]:${resetcolorcode} ${info.message}`;
});

module.exports = function(callingModule) {

  // check if callingModule is actually a module
  if( callingModule === Object(callingModule) ){
    const aModulesLabel = getLabel(callingModule);
    const logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.splat(),
        winston.format.label({ label: aModulesLabel }),
        winston.format.timestamp(),
        myLogFormatter
      ),
      transports: [
        new winston.transports.File({
          level: 'debug',
          maxsize:'10000000',
          maxFiles: 10,
          filename: path.resolve(global.__datadir && path.join(global.__datadir, 'server.log') || 'server.log'),
          handleExceptions: true,
          humanReadableUnhandledException: true,
        })
      ]
    });
    logger.add(new winston.transports.Console({
      level: loglevel,
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.splat(),
        winston.format.label({ label: aModulesLabel }),
        winston.format.timestamp(),
        myLogFormatter
      )
    }));

    return logger;
  }
  // if callingModule is not a module use simply the string and no file logger
  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: loglevel,
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.splat(),
          winston.format.label({ label: callingModule }),
          winston.format.timestamp(),
          myLogFormatter
        )
      })
    ]
  });

};