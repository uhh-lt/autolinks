
'use strict';

/* imports */
const
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
        "value": {
            "subject": {
                "rid": 0,
                "cid": 1,
                "metadata": {},
                "value": "Tim",
            },
            "predicate": {
                "rid": 0,
                "cid": 1,
                "metadata": {},
                "value": "ist",
            },
            "object": {
                "rid": 0,
                "cid": 1,
                "metadata": {},
                "value": "toll",
            },
        },
    });
console.log(test1.value + " is Triple? " + (test1.value instanceof Triple));
console.log(test1.value);
console.log(test1.value.subject);
console.log(test1.value.predicate);
console.log(test1.value.object);

let test2 = new Resource().deepAssign({
    "rid": 0,
    "cid": 1,
    "metadata": {},
    "value": "Tim",
});
console.log(test2.value + " is String? " + (typeof(test2.value) === 'string' || test2.value instanceof String));

let test3 = new Resource().deepAssign({
    "rid": 0,
    "cid": 1,
    "metadata": {},
    "value": [
        {
            "rid": 0,
            "cid": 1,
            "metadata": {},
            "value": "Tim",
        },
        {
            "rid": 0,
            "cid": 1,
            "metadata": {},
            "value": "ist",
        }
    ],
});
console.log(test3.value + " is Array? " + (test3.value instanceof Array));


let test_resource = new Resource();
test_resource.deepAssign({
    "rid": 0,
    "cid": 1,
    "metadata": {},
    "value":[
        {
            "rid": 0,
            "cid": 1,
            "metadata": {},
            "value": "string",
        },
        {
            "rid": 0,
            "cid": 1,
            "metadata": {},
            "value": {
                "subject": {
                    "rid": 0,
                    "cid": 1,
                    "metadata": {},
                    "value": "string",
                },
                "predicate":
                {
                    "rid": 0,
                    "cid": 1,
                    "metadata": {},
                    "value": "string",
                },
                "object":
                {
                    "rid": 0,
                    "cid": 1,
                    "metadata": {},
                    "value": {
                        "subject": {
                            "rid": 0,
                            "cid": 1,
                            "metadata": {},
                            "value": "string",
                        },
                        "predicate":
                            {
                                "rid": 0,
                                "cid": 1,
                                "metadata": {},
                                "value": "string",
                            },
                        "object":
                            {
                                "rid": 0,
                                "cid": 1,
                                "metadata": {},
                                "value": "string",
                            },
                    },
                },
            },
        },
        {
            "rid": 0,
            "cid": 1,
            "metadata": {},
            "value": [
                {
                    "rid": 0,
                    "cid": 1,
                    "metadata": {},
                    "value": "string1",
                },
                {
                    "rid": 0,
                    "cid": 1,
                    "metadata": {},
                    "value": "string2",
                },
            ],
        }
    ],
});
log_resource(test_resource);
console.log(test_resource.value[1]);
console.log(test_resource.value[1].value.object);
console.log(test_resource.value[2]);