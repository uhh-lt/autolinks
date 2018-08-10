'use strict';

const pino = require('pino');

const loglevel = process.env.LOGLEVEL || 'info';

function getLabel(callingModule) {
  const parts = callingModule.filename.split('/');
  return parts[parts.length - 2] + '/' + parts.pop();
}

module.exports = function(callingModule) {
  // check if callingModule is actually a module
  let label = '';
  if( callingModule === Object(callingModule) ){
    label = getLabel(callingModule);
  }else{
    // if callingModule is not a module use simply the string and no file logger
    label = callingModule;
  }
  const dest = pino.extreme();
  const logger = pino({
    level: loglevel,
    name: label,
    base: {},
    prettyPrint: {
      levelFirst : true,
      translateTime : 'SYS:standard',
      colorize: loglevel === 'debug' || loglevel === 'trace'
    }}, dest);
  logger.destination = dest;
  return logger;
};