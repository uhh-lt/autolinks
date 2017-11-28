'use strict';

const logger = require('../log')(module);

module.exports = {

  getLabel : function(fname) {
    const parts = fname.split('/');
    const basename = parts.pop();
    const mname = basename.substring(0,basename.lastIndexOf('.'));
    return mname;
  }

}
