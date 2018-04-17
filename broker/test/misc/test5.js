const
  fs = require('fs'),
  Offset = require('../../model/Offset').model,
  DOffset = require('../../model/DOffset').model,
  Analysis = require('../../model/Analysis').model;

const a = JSON.parse(fs.readFileSync('./example.json'));
const ana = new Analysis().deepAssign(a);

// console.log(ana);
ana.prepareIndex();
// console.log(ana.annotation_index);
const annot = ana.getAnnotationsWithinOffset(new Offset(0,7));
//
// console.log(annot.size);
annot.forEach(a => console.log(a.type));





