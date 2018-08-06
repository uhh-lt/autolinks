'use strict';

const util = require('../../controller/utils/utils'),
  Resource = require('../../model/Resource').model,
  mysqldb = require('../../controller/storage-components/mysql-db');


mysqldb.init((err, r) => {

  // mysqldb.getParentResources(61, []).then(
  // mysqldb.getSources(61, 'BCRs').then(
  // mysqldb.getStorageKey(61, [26 ,30, 31]).then(
  mysqldb.promisedFindResources(1,'B cell', true).then(
    r => console.log(r),
    e => console.error(e)
  );

  setTimeout(function(){
    mysqldb.close((err) => {});

  }, 4000);

});





