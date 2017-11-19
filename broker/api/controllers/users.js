'use strict';

const logger = require('../../controller/log')(module)
  , auth = require('../../controller/auth')
  ;

module.exports = {
  get_user_info: get_user_info
};


function get_user_info(req, res) {
  auth.authenticated_request(
    'basic',
    req,
    res,
    function(err, user) {
      res.header('Content-Type', 'application/json');
      if(err){
        res.status(401);
        return res.end(JSON.stringify({ message: err.message, fields: { error: err } }));
      }
      res.end(JSON.stringify(user));
    }
  );
}
