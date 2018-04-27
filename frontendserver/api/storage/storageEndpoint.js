var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var storageEdit = require('./editResource');
var documentLists = require('./getDocuments');

router.post('/editResource', editResource);
router.get('/getDocuments', getDocuments);

module.exports = router;

function editResource(req, res) {
    const token = req.session.token;
    const data = req.body.data;
    const options = storageEdit(config.apiUrl, token, data);
    request(options, function (error, response, body) {
      res.send(body);
    });
}


function getDocuments(req, res) {
    const token = req.session.token;
    const options = documentLists(config.apiUrl, token);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
