'use strict';

const
  fs = require('fs'),
  path = require('path'),
  nlp_utils = require('../../controller/utils/nlp_utils'),
  Offset = require('../../model/Offset').model,
  DOffset = require('../../model/DOffset').model,
  Analysis = require('../../model/Analysis').model;

const fname = path.join(path.dirname(module.filename), 'example.json');

const a = JSON.parse(fs.readFileSync(fname));
const ana = new Analysis().deepAssign(a);

// console.log(ana);
ana.prepareIndex();
// console.log(ana.annotation_index);
const doff = new DOffset([ new Offset(0,7) ]);

console.log(doff.begin());
console.log(doff.end());

const annot = ana.getAnnotationsWithinDOffset(new DOffset([ new Offset(0,7) ]));
//
// console.log(annot.size);
const mapped = [...annot].map(a => `${a.type}: [${a.begin()},${a.end()}]`);
console.log(mapped);

nlp_utils.getAnnotationResources(1, ana, doff).then(r => console.log(JSON.stringify(r, null, 2)));



