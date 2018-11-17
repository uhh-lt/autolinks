var request = require('request');
﻿var config = require('config');
var express = require('express');
var router = express.Router();

var serviceCall = require('./call');
var serviceList = require('./list');
var serviceGet = require('./get');

router.get('/listServices', list);
router.post('/get', get);
router.post('/call', call);

module.exports = router;

function list(req, res){
    const options = serviceList(config().apiUrl);
    request(options, function (error, response, body) {
      res.send(typeof(body) === "number" ? body.toString() : body);
    });
}

function get(req, res){
    const token = req.session.token;
    let data = req.body.data;
    if (data) {
      const options = serviceGet(config().apiUrl, token, data);
      request(options, function (error, response, body) {
        res.send(typeof(body) === "number" ? body.toString() : body);
      });
    }
}

function call(req, res) {
    const token = req.session.token;
    let data = req.body.data;
    if (data) {
      const options = serviceCall(config().apiUrl, token, data);
      request(options, function (error, response, body) {
        res.send(typeof(body) === "number" ? body.toString() : body);
      });
    }
}
