'use strict';

let
  es = require('./controller/es');

es.init(function(err){
  console.log(err);
});


console.log('Search1:');
const text = 'Jaguar';
es.search(text)
  .then(r => JSON.stringify(r, null, 2))
  .then(console.log, console.error);

// es.search(
//   text,
//   (err, result) => {
//     if(result){
//       console.log(es.transformSearchResults(text, result));
//     }
//   },
//   (err) => {
//     if(err){
//       console.log(err);
//     }
//   }
// );

// module.exports.query('enwiki', text, 0, 2, ,




// console.log('Close:');
// es.close(function(err){
//    console.log(err);
// });

