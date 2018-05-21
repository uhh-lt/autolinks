var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', function (req, res) {
    // register using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/user/register',
        headers: {
           'Content-Type': 'application/json',
           'Accept': 'application/json'
         },
        body: { 'name': req.body.name, 'password': req.body.password },
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('register', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('register', {
                error: body.message,
                // firstName: req.body.firstName,
                // lastName: req.body.lastName,
                name: req.body.name
            });
        }

        // return to login page with success message
        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});

module.exports = router;
