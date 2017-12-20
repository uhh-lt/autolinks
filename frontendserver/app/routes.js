var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var serviceList = require('app/endpoints/serviceList');
var router = express.Router();


// routes
// router.post('/authenticate', authenticateUser);
// router.post('/register', registerUser);
// router.get('/current', getCurrentUser);
// router.put('/:_id', updateUser);
// router.delete('/:_id', deleteUser);

// module.exports = router;


module.exports = function (app) {
    debugger;
    app.get('/api/data/', function (req, res) {

      var resp = [];

      // var options = {
      //       url: 'http://localhost:8080/find',
      //       method: 'POST',
      //       headers: {
      //          'Content-Type': 'application/json',
      //          'Accept': 'application/json'
      //        },
      //       json: true,
      //       body: {
      //         "query": {
      //             "query": {
      //                 "match": {
      //                     "title": "Germany"
      //         }
      //             }
      //         },
      //           'wiki': [
      //             'simplewiki'
      //           ]
      //        }
      //     }

          var options = {
                url: config.apiUrl + 'service/details',
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Accept': 'application/json'
                 },
                json: true,
                body: {
                  "name": "string",
                  "extended": true
                 }
              }

        console.log('hello world call');
        var req = request(options, function (error, response, body) {
          // console.log('error:', error); // Print the error if one occurred
          // console.log('statusCode:', response && response.statusCode); // Print  the response status code if a response was received
          // console.log('body:', body); // Print the HTML for the Google homepage.
          // console.log(body);
          res.send(body);
        });
    });

    // app.get('/service/call/', function (req, res) {
    //
    //   var resp = [];
    //
    //       var options = {
    //             url: config.apiUrl + 'service/call',
    //             method: 'POST',
    //             headers: {
    //                'Content-Type': 'application/json',
    //                'Accept': 'application/json'
    //              },
    //             json: true,
    //             body: {
    //               "service": "Dummy",
    //               "path": "/bar",
    //               "method": "get",
    //               "data": {}
    //              }
    //           }
    //
    //     console.log('service call');
    //     var req = request(options, function (error, response, body) {
    //       res.send(body);
    //     });
    // });

    app.get('/service/call/', function (req, res) {

      var resp = [];

          var options = {
                url: config.apiUrl + 'service/call',
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                   'Accept': 'application/json',
                   'authorization': 'Basic am9objpkb2U='
                 },
                json: true,
                body: {
                  "service": "Dummy",
                  "path": "/baz/{username}",
                  "method": "post",
                  "data": {}
                 }
              }

        console.log('service call');
        var req = request(options, function (error, response, body) {
          res.send(body);
        });
    });

    // Basic Authorization
    // curl -X POST "http://localhost:10000/service/call" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"service\": \"Dummy\", \"path\": \"/baz/{username}\", \"method\": \"post\", \"data\": {}}" -H "authorization: Basic am9objpkb2U="

    // application -------------------------------------------------------------
    app.get('/', function (req, res) {
        //make public/index.html default route
        res.redirect('public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
