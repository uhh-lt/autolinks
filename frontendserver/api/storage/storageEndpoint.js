var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var storageEdit = require('./editResource');
var documentLists = require('./getDocuments');
var documentUpload = require('./postDocuments');

router.post('/editResource', editResource);
router.get('/getDocuments', getDocuments);
router.post('/postDocuments', postDocuments);

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

function postDocuments(req, res) {
    const token = req.session.token;
    const file = req.files.uploadedFile;
    const options = documentUpload(config.apiUrl, token, file);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
