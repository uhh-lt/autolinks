'use strict';

const util = require('../../controller/utils/utils'),
  Analysis = require('../../model/Analysis'),
  nlp = require('../../controller/nlp_wrapper');

const text = `Hello, ich bin ein Berliner! Manchmal bin ich auch ein Hamburger.      


    Und ganz selten auch ein Frankfurter?!? `


nlp.analyze(text, 'text/plain', 'whereever')
  .then(a => console.log(JSON.stringify(a, null, 2)), err => console.log(err));


const promises = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];

util.promiseSequential(promises).then(r => console.log(r));

setTimeout(function(){

}, 4000);