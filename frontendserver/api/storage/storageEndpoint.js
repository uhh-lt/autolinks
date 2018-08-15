var request = require('request');
﻿var config = require('config');
var express = require('express');
var fs = require('fs');

var annotationDid = require('./annotationDid');

var resourceEdit = require('./editResource');
var resourceGet = require('./getResource');
var resourceSearch = require('./searchResource');

var documentDelete = require('./deleteDocument');
var documentLists = require('./getDocuments');
var documentUpload = require('./postDocuments');

var router = express.Router();
var dir = './uploads/';

router.post('/postAnnotationDid', postAnnotationDid);

router.post('/editResource', editResource);
router.post('/getResource', getResource);
router.post('/searchResource', searchResource);

router.get('/getDocuments', getDocuments);
router.post('/postDocuments', postDocuments);
router.post('/deleteDocument', deleteDocument);

module.exports = router;

function editResource(req, res) {
    const token = req.session.token;
    const data = req.body.data;
    if (data) {
      const options = resourceEdit(config().apiUrl, token, data);
      request(options, function (error, response, body) {
        res.send(body);
      });
    }
}

function getResource(req, res) {
    const token = req.session.token;
    const data = req.body.data;
    const options = resourceGet(config().apiUrl, token, data);
    request(options, function (error, response, body) {
      res.send(body);
    });
}

function searchResource(req, res) {
    const token = req.session.token;
    const data = req.body.data;
    if (data) {
      const options = resourceSearch(config().apiUrl, token, data);
      request(options, function (error, response, body) {
        res.send(body);
      });
    }
}

function getDocuments(req, res) {
    const token = req.session.token;
    const options = documentLists(config().apiUrl, token);
    request(options, function (error, response, body) {
      res.send(body);
    });
}

function postAnnotationDid(req, res) {
    const token = req.session.token;
    const username = req.session.username;
    const data = req.body.data;
    const annotations = data.newAnnotations.annotations;

    if (annotations) {
      for (anno in annotations) {
        const options = annotationDid(config().apiUrl, data, token, username, annotations[anno]);
        request(options, function (error, response, body) {
          res.send(body);
        });
      }
    }
}

function postDocuments(req, res) {
    const token = req.session.token;
    const file = req.files.docFile;
    const overwrite = req.body.overwrite;

    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, 0777);
    }
    // Use the mv() method to place the file somewhere on the server
    if (file) {
      file.mv(dir + file.name, function(err) {
        if (err)
          return res.status(500).send(err);

        const options = documentUpload(config().apiUrl, token, file, dir, overwrite);
        request(options, function (error, response, body) {
          fs.unlinkSync(dir + file.name)
          res.send(body);
        });
      });
    }
}

function deleteDocument(req, res) {
    const token = req.session.token;
    const docId = req.body.did;
    if (docId) {
      const options = documentDelete(config().apiUrl, token, docId);
      request(options, function (error, response, body) {
        res.send(body);
      });  
    }
}
