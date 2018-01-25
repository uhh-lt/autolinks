var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var serviceCall = require('./call');
var serviceList = require('./list');

router.get('/listServices', list);
router.post('/call', call);

module.exports = router;

function list(req, res){
    const options = serviceList(config.apiUrl);
    request(options, function (error, response, body) {
      res.send(body);
    });
}

function call(req, res) {
    let data = req.body.data;
    const options = serviceCall(config.apiUrl, data);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
