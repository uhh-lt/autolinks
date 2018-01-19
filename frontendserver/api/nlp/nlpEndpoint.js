var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var nlpAnalyze = require('./analyze');

router.post('/analyze', analyze);

module.exports = router;

function analyze(req, res){
    const options = nlpAnalyze(req.body.text);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
