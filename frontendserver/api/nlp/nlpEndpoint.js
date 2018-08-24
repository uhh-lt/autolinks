var request = require('request');
﻿var config = require('config');
var express = require('express');
var router = express.Router();
var nlpAnalyze = require('./analyze');
var nlpAnalyzeDid = require('./analyzeDid');
var nlpInterpretDid = require('./interpretDid');

router.post('/analyze', analyze);
router.post('/analyzeDid', analyzeDid);
router.post('/interpretDid', interpretDid);

module.exports = router;

function analyze(req, res){
    const token = req.session.token;
    const data = req.body.data;
    if (data) {
      const options = nlpAnalyze(config().apiUrl, token, req.body.text);
      request(options, function (error, response, body) {
        res.send(body);
      });
    }
}

function analyzeDid(req, res){
    const token = req.session.token;
    const did = req.body.did;
    if (did) {
      const options = nlpAnalyzeDid(config().apiUrl, token, did);
      request(options, function (error, response, body) {
        res.send(body);
      });
    }
}

function interpretDid(req, res){
    const token = req.session.token;
    const data = req.body;
    if (data) {
      const options = nlpInterpretDid(config().apiUrl, token, data);
      request(options, function (error, response, body) {
        res.send(body);
      });
    }
}
