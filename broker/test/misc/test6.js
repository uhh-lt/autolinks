'use strict';

const util = require('../../controller/utils/utils'),
  Resource = require('../../model/Resource').model,
  mysqldb = require('../../controller/storage-components/mysql-db');


mysqldb.init((err, r) => {

  // mysqldb.getParentResources(61, []).then(
  // mysqldb.getSources(61, 'BCRs').then(
  // mysqldb.getStorageKey(61, [26 ,30, 31]).then(
  mysqldb.fillSourcesRecursive(61, new Resource().deepAssign(

    {
      "rid": 31,
      "value": [
        {
          "rid": 30,
          "value": {
            "subject": {
              "rid": 27,
              "value": "BCRs",
              "cid": 31,
              "metadata": {
                "aka": "Simon"
              },
              "sources": {}
            },
            "predicate": {
              "rid": 29,
              "value": "says",
              "cid": 31,
              "metadata": {},
              "sources": {}
            },
            "object": {
              "rid": 28,
              "value": "hello",
              "cid": 31,
              "metadata": {},
              "sources": {}
            }
          },
          "cid": 31,
          "metadata": {},
          "sources": {}
        }
      ],
      "cid": -1,
      "metadata": {},
      "sources": {}
    }

  )).then(
    r => console.log(JSON.stringify(r, null, 2)),
    e => console.error(e)
  );

  setTimeout(function(){
    mysqldb.close((err) => {});

  }, 4000);

});





