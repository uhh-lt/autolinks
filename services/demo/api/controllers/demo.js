'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
const
  ServiceParameter = require('../../../../broker/model/ServiceParameter').model,
  Exception = require('../../../../broker/model/Exception').model,
  Triple = require('../../../../broker/model/Triple').model,
  Resource = require('../../../../broker/model/Resource').model,
  util = require('util');

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
  Param 3: a handle to the callback which will be executed next
 */
module.exports.demo = function(req, res, next) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  // Get the serviceParameter object from the request and handle the error properly if it fails
  ServiceParameter.fromRequest(req, function(err, serviceParameter) {

    if (err) {
      return Exception.handleErrorResponse(err, res).end(next);
    }

    // get the text for the offset
    const text = serviceParameter.focus.getText(serviceParameter.context.text) || 'Simon';

    let resource_triple = new Resource(null, new Triple(
        new Resource(null, [
            new Resource(null, new Triple(new Resource(null, "BCR"), new Resource(null, "is synonym of"), new Resource(null, "B-cell receptor"))),
            new Resource(null, new Triple(new Resource(null, "B-cell receptor"), new Resource(null, "binds"), new Resource(null, "Antigen"))),

        ]),
        new Resource(null, "part-of"),
        new Resource(null, "B Cell")));

    let resource_triple1 = new Resource(null, new Triple(new Resource(null, "B_CLL"), new Resource(null, "affects"), new Resource(null, "B Cell")));
    let resource_triple2 = new Resource(null, new Triple(new Resource(null, "B_CLL"), new Resource(null, "is a"), new Resource(null, "Disease")));
    let resource_triple3 = new Resource(null, new Triple(new Resource(null, "B_CLL"), new Resource(null, "affects"), new Resource(null, "Caucasian race")));
    let resource_triple4 = new Resource(null, new Triple(new Resource(null, "V(D)J recombination"), new Resource(null, "affects"), new Resource(null, "B-cell receptor")));
    let resource_triple5 = new Resource(null, new Triple(new Resource(null, "IgVH Mutation"), new Resource(null, "causes"), new Resource(null, "V(D)J recombination")));

    let result = new Resource();
    result.value = [
        resource_triple,
        resource_triple1,
        resource_triple2,
        resource_triple3,
        resource_triple4,
        resource_triple5,
    ];

    let triples =
        [
          new Triple(
            [
              new Triple('BCR', 'is synonym', 'B-cell receptor'),
              new Triple('B-cell receptor', 'binds', 'Antigen')
            ],
            'part-of',
            'B Cell'
          ),
          new Triple('B_CLL', 'affects', 'B Cell'),
          new Triple('B_CLL', 'is a', 'Disease'),
          new Triple('B_CLL', 'affects', 'Caucasian race'),
          new Triple('V(D)J recombination', 'affects', 'B-cell receptor'),
          new Triple('IgVH Mutation', 'causes', 'V(D)J recombination'),
        ];

    // this sends back a JSON response and ends the response
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.json(result);
    res.end(next);

  });

};
