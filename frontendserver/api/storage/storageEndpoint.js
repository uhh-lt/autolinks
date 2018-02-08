var request = require('request');
﻿var config = require('config.json');
var express = require('express');
var router = express.Router();
var storageEdit = require('./editResource');

router.post('/editResource', editResource);

module.exports = router;

function editResource(req, res) {
    const data = req.body.data;
    const options = storageEdit(config.apiUrl, data);
    request(options, function (error, response, body) {
      res.send(body);
    });
}
