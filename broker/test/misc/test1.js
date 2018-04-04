'use strict';

const util = require('../../controller/utils/utils'),
  Analysis = require('../../model/Analysis'),
  nlp = require('../../controller/nlp_wrapper');

const text = `Hello, ich bin ein Berliner! Manchmal bin ich auch ein Hamburger.      


    Und ganz selten auch ein Frankfurter?!? `


nlp.analyze(text, 'text/plain', 'whereever', (err, a) => {
  console.log(err);
  console.log(a);
});

