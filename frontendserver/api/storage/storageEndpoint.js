var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var storageEdit = require('./editResource');

router.post('/editresource', editResource);

module.exports = router;

function editResource(req, res){
    const options = storageEdit(config.apiUrl, req.body.text);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
