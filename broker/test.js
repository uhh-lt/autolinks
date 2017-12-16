
'use strict';

/* imports */
const
  Triple = require('./model/Triple'),
  Offset = require('./model/Offset'),
  Annotation = require('./model/Annotation'),
  Analysis = require('./model/Analysis');

const o = new Offset(3,10);

console.log(o.end());
console.log(o.end);

console.log(o.getText("The quick brown fox jumps"));

console.log(Offset.prototype.isPrototypeOf(o));

const o2 = new Offset(3);

console.log(o2.getText("The quick brown fox jumps"));

console.log(Offset.prototype.isPrototypeOf(o2));

console.log(o2 instanceof Offset);
console.log(o2 instanceof Analysis);

const a = new Analysis()
a.text = "sacsd"

console.log(a)
console.log(a.text)
console.log(a.source)

const b = Object.create(Analysis.prototype)
console.log(b)

const c = new Triple()
console.log(c)
c.resolve()

const d = new Annotation();
const e = new Annotation();
console.log(d)
d.doffset.push(new Offset(1,10));
console.log(d.doffset)
console.log(e.doffset)

// const d = new Document('hello world');
// d.source = 'asdas';
//
//
// console.log(d.end());
// console.log(d.text);
// console.log(d.source);
// console.log(d.lang);



