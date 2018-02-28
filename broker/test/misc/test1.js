'use strict';

const util = require('../../controller/utils/utils');

const wait = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));
const p = () => new Promise((resolve, reject) => {
  setTimeout(() => console.log('1 second passed.'), 1000);
  resolve();
});

const x = wait(3000);
const y = x.then(p);

console.log('x: ', x);
console.log('y: ', y);

console.log('----');

const z = Promise.all([
  x,
  y
]);
console.log('z: ', z);

console.log('----');

function fun(i){
  const w = Math.random() * 100;
  util.pauuse(w);
  console.log(`I promise ${i}`);
  return `${i} waited ${w}`;
}

function makenewpromise(i) {
  return new Promise(function(resolve, reject) {
    try {
      return resolve(fun(i));
    } catch(e) {
      return reject(`${i} failed`);
    }
  });
}

const l = [1,2,3,4,5,6,7,8,9,0].map(i => makenewpromise(i)).concat(makenewpromise(11));

const ll = Promise.all(l)//.catch(e => console.log(e));
// console.log(ll);

const r = ll.then((r) => console.log('result: ', r), e => console.log(e));
// const r = l.reduce((p, f) => p.then(f), Promise.resolve());

setTimeout(()=>{
  console.log(r);
}, 3000);



wait(10000);