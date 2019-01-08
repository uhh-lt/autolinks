var express = require('express');
var router = express.Router();

router.get('/getUsername', getUsername);

module.exports = router;

function getUsername(req, res){
    const username = req.session.username;
    res.send(typeof(username) === "number" ? username.toString() : username);
}
