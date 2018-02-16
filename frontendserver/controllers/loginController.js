var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    // log user out
    delete req.session.token;

    // move success message into local variable so it only appears once (single read)
    var viewData = { success: req.session.success };
    delete req.session.success;

    // res.render('login', viewData);
    res.render('login');
});

router.post('/', function (req, res) {
    // authenticate using api to maintain clean separation between layers
    const conf_url = config.apiUrl.replace('http://', '');
    const url = 'http://' + req.body.username + ':' + req.body.password + '@' + conf_url + '/user/info';
    request.get({
        url: url,
        // form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }

        if (!body.active) {
            return res.render('login', { error: body.message, name: req.body.name });
        }

        const token = body.name + '@' + body.password;
        const tokenBase64 = 'Basic ' + new Buffer(token).toString('base64')

        // save JWT token in the session to make it available to the angular app
        req.session.token = tokenBase64; //body.token;

        // redirect to returnUrl
        var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
        res.redirect(returnUrl);
    });
});

module.exports = router;
