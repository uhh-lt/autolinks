
'use strict';

/* imports */
const
  Offset = require('./model/Offset'),
  Document = require('./model/Document');

const o = new Offset(3,10);

console.log(o.end());
console.log(o.end);

console.log(o.getText("The quick brown fox jumps"));

console.log(Offset.prototype.isPrototypeOf(o));

const o2 = new Offset(3);

console.log(o2.getText("The quick brown fox jumps"));

console.log(Offset.prototype.isPrototypeOf(o2));

console.log(o2 instanceof Offset);
console.log(o2 instanceof Document);



// const d = new Document('hello world');
// d.source = 'asdas';
//
//
// console.log(d.end());
// console.log(d.text);
// console.log(d.source);
// console.log(d.lang);



