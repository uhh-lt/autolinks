
'use strict';

/* imports */
const
  Exception = require('./model/Exception'),
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



const f = { from : 1, to : 10 };
console.log(f instanceof Offset);
console.log(f);

const g = Object.assign(new Offset(), f);
console.log(g instanceof Offset);
console.log(g);

const h = {
  text: 'hello world.',
  source: 'bla.html',
  annotations: [
    new Annotation().assign({
      type: 'word',
      analyzer: 'manual',
      properties: {},
      doffset: [
        new Offset(7, 5)
      ]
    })
  ]
};

console.log(h);
const i = Object.assign(new Analysis(), h);
console.log(h instanceof Analysis);
console.log(i instanceof Analysis);
console.log(i);
console.log(i.annotations[0] instanceof Annotation);

const j = new Analysis().assign(h);
console.log(j instanceof Analysis);
console.log(j.annotations[0] instanceof Annotation);
console.log(j.annotations[0].doffset[0] instanceof Offset);

const k = Exception.fromError(new Error('dasdkba'), 'kjqebrhkwb');
console.log(k)





