
'use strict';

/* imports */
const
  Exception = require('./model/Exception'),
  Triple = require('./model/Triple'),
  Offset = require('./model/Offset'),
  Annotation = require('./model/Annotation'),
  mysqldb = require('./controller/storage-components/mysql-db'),
  utils = require('./controller/utils/utils'),
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
console.log(i.getAvailableTypes());
console.log(i.annotations[0] instanceof Annotation);

const j = new Analysis().assign(h);
console.log(j instanceof Analysis);
console.log(j.annotations[0] instanceof Annotation);
console.log(j.annotations[0].doffset[0] instanceof Offset);

const k = Exception.fromError(new Error('dasdkba'), 'kjqebrhkwb');
console.log(k)

console.log('\n\n\ndbtest: ');
mysqldb.init((err, r) => {
  if(err) {
    return console.log(err);
  }
  console.log(r);

//
//
// // const x = Promise.all([
// //   mysqldb.saveNewResourceValue(null),
// //   mysqldb.saveNewResourceValue('hello new world'),
// //   mysqldb.saveNewResourceValue('hello funny world'),
// //   mysqldb.saveNewResourceValue('hello world')
// // ]).then((i) => console.log(`fullfilled ${i}`), (err) => console.log(`rejected ${err}`));
//
// const y = mysqldb.saveTriple(new Triple('You', 'save', 'the world'));
//
//   const z = mysqldb.saveNewResourceValue([
//     new Triple('I','am','God')
//   ]);
//
//   setTimeout(function(){
//     console.log(z);
//   }, 1000);

  // mysqldb.saveResourceTripleMapping(23,231).then(console.log,console.error);
  // mysqldb.saveStorageResourceMapping(23,21).then(console.log,console.error);
  // mysqldb.saveStorageItemToResourceMapping('me','asdjbao').then(console.log, console.error);

  // mysqldb.createUsergroup('me').then(console.log, console.error);
  const arr = [
    'hello',
    ['hallo hallo', new Triple('i','am','goof')],
    new Triple('I', 'save', [ 'world',
      new Triple('I', [ new Triple('You', 'saved', 'me') ], 'you')
    ]),
    new Triple('You', 'save', 'the world'),
    new Triple('He', 'save', 'me'),
    new Triple('ME', 'save', 'He'),
    'hallo welt'
  ];

  // try writing
  mysqldb.write('me', '12345', arr,
    function(err, res) {
      if(err){
        return console.log(err);
      }
      return console.log(JSON.stringify(res, null, 2));
    });


  // mysqldb.getTriple(2).then(console.log,console.err);
  // mysqldb.getResource(12).then(console.log,console.err);
  // setTimeout(function(){
  //   mysqldb.getStorageResource('me', '12345').then(r => JSON.stringify(r, null, 2)).then(console.log, console.err);
  // }, 1500);



  setTimeout(function(){

    mysqldb.getResource(1)
      .then(r => JSON.stringify(r, null, 2))
      .then(console.log)
      .then(mysqldb.promisedEditResource({rid: 1, value: 'hello'}, null))
      .then(mysqldb.getResource(1))
      .then(r => JSON.stringify(r, null, 2))
      .then(console.log)
      .then(r => mysqldb.promisedEditResource(null, {value: 'ashdoiahs'}))
      .then(r => mysqldb.getResource(r.rid))
      .then(r => JSON.stringify(r, null, 2))
      .then(console.log)
      .then(r => mysqldb.promisedEditResource({rid: 18, cid : 3}, {rid: 18, cid : 27}))
      .then(r => mysqldb.getResource(r.rid))
      .then(r => JSON.stringify(r, null, 2))
      .then(console.log)
      .then(r => mysqldb.promisedEditResource({rid: 1, metadata : {}}, {rid: 1, metadata : {label : "hallo"}}))
      .then(r => mysqldb.getResource(r.rid))
      .then(r => JSON.stringify(r, null, 2))
      .then(console.log);



  }, 1500);

  setTimeout(function(){
    mysqldb.close((err) => {});
  }, 4000);

}, true);






