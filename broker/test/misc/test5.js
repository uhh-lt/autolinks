const
  fs = require('fs'),
  stupidnlp = require('../../controller/nlp-components/StupidNLP'),
  Analysis = require('../../model/Analysis').model;

// const ana = JSON.parse(fs.readFileSync('./example.json'));
// console.log(ana);


stupidnlp.analyze('Ich bin ein Berliner.','','')
  .then(ana => console.log(JSON.stringify(ana, null, 2)));


