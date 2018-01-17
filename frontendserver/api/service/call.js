module.exports = function call(req, res) {
    var request = require('request');
    ﻿var config = require('config.json');

    debugger;
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
      debugger;
      res.send(body);
    });
}
