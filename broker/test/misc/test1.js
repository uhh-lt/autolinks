'use strict';

const util = require('../../controller/utils/utils'),
  Analysis = require('../../model/Analysis'),
  mysqldb = require('../../controller/storage-components/mysql-db'),
  nlp = require('../../controller/nlp_wrapper');

const text = `Hello, ich bin ein Berliner! Manchmal bin ich auch ein Hamburger.      


    Und ganz selten auch ein Frankfurter?!? `

mysqldb.init((err, r) => {

  nlp.analyze(text, 'text/plain', 'whereever')
    .then(a => mysqldb.updateDocumentAnalysis(61, 1, a))
    .then(r => console.log(r), e => console.error(e));

  setTimeout(function(){
    mysqldb.close((err) => {});

  }, 4000);

});





