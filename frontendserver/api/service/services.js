var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var serviceCall = require('./call');

router.get('/listServices', listServices);
router.post('/call', call);

module.exports = router;

function listServices(req, res){
    var options = {
          url: config.apiUrl + '/service/listServices',
          method: 'GET',
          headers: {
             'Content-Type': 'application/json',
             'accept': 'application/json'
           },
          json: true,
        }
    var req = request(options, function (error, response, body) {
      res.send(body);
    });
}

function call(req, res) {
    var options = {
      url: config.apiUrl + '/service/call',
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Accept': 'application/json',
         'authorization': 'Basic am9objpkb2U='
       },
      json: true,
      body:
      {
        "service": "Wiki",
        "version": "0.0.1",
        "path": "/findarticles",
        "method": "post",
        "data": {
          "focus": {
            "offsets": [
              {
                "from": 0,
                "length": 15
              }
            ]
          },
          "context": {
            "text": req.body.text,
            "source": "string",
            "lang": "string",
            "availabletypes": [
              "string"
            ],
            "annotations": [
              {
                "type": "string",
                "doffset": {
                  "offsets": [
                    {
                      "from": 0,
                      "length": 0
                    }
                  ]
                },
                "properties": {},
                "analyzer": "string"
              }
            ]
          }
        }
      }
    }

    var req = request(options, function (error, response, body) {
      res.send(body);
    });
}
