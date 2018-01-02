'use strict';

let
  es = require('./controller/es');

es.init(function(err){
  console.log(err);
});

es.ping(function(err){
  console.log(err);
});

// console.log('Search1:');
// es.search('jaguar', function(err, result){
//   console.log(err);
//   console.log(result);
// }, (e) => {});


console.log('Search2:');
const text = 'Jaguar';
es.search(
  text,
  function(err, result){
    if(result){
      console.log(es.transformSearchResults(text, result));
    }
  },
  function(err){
    if(err){
      console.log(err);
    }
  }
);




// console.log('Close:');
// es.close(function(err){
//    console.log(err);
// });

