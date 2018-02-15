
'use strict';

/* imports */
const
    Exception = require('../../model/Exception'),
    Triple = require('../../model/Triple').model,
    Resource = require('../../model/Resource').model;

const log_resource = function(resource) {
    console.log(resource);
    console.log("isStringResource:" + resource.isStringResource());
    console.log("isListResource:" + resource.isListResource());
    console.log("isTripleResource:" + resource.isTripleResource());
};

let string_resource = new Resource(5, "tim", 4, {"status": "enabled"});
log_resource(string_resource);

let triple_resource = new Resource(5, new Triple("Tim", "ist", "toll"), 4, {"status": "enabled"});
log_resource(triple_resource);

let list_resource = new Resource(5, [new Triple("Tim", "ist", "toll"), new Triple("Tim", "ist", "toll"),"tim"], 4, {"status": "enabled"});
log_resource(list_resource);

let test_triple = new Triple("Tim", "ist", "toll");
console.log(test_triple);

let test_triple2 = new Triple();
console.log(test_triple2);

let test1 = new Resource().deepAssign({
        "rid": 0,
        "cid": 1,
        "metadata": {},
        "value": {},
    });
console.log(test1.value instanceof Triple);


// let test_resource = new Resource();
// test_resource.deepAssign({
//     "rid": 0,
//     "cid": 1,
//     "metadata": {},
//     "value":[
//         {
//             "rid": 0,
//             "cid": 1,
//             "metadata": {},
//             "value": "string",
//         },
//         {
//             "rid": 0,
//             "cid": 1,
//             "metadata": {},
//             "value": {
//                 "subject": {
//                     "rid": 0,
//                     "cid": 1,
//                     "metadata": {},
//                     "value": "string",
//                 },
//                 "predicate":
//                 {
//                     "rid": 0,
//                     "cid": 1,
//                     "metadata": {},
//                     "value": "string",
//                 },
//                 "object":
//                 {
//                     "rid": 0,
//                     "cid": 1,
//                     "metadata": {},
//                     "value": "string",
//                 },
//             },
//         },
//         {
//             "rid": 0,
//             "cid": 1,
//             "metadata": {},
//             "value": [
//                 {
//                     "rid": 0,
//                     "cid": 1,
//                     "metadata": {},
//                     "value": "string1",
//                 },
//                 {
//                     "rid": 0,
//                     "cid": 1,
//                     "metadata": {},
//                     "value": "string2",
//                 },
//             ],
//         }
//     ],
// });
// log_resource(test_resource);