var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var nlpAnalyze = require('./analyze');
var nlpAnalyzeDid = require('./analyzeDid')

router.post('/analyze', analyze);
router.post('/analyzeDid', analyzeDid);

module.exports = router;

function analyze(req, res){
    const token = req.session.token;
    const data = req.body.data;
    const options = nlpAnalyze(config.apiUrl, token, req.body.text);
    request(options, function (error, response, body) {
      res.send(body);
    });
}

function analyzeDid(req, res){
    const token = req.session.token;
    const did = req.body.did;
    const options = nlpAnalyzeDid(config.apiUrl, token, did);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
