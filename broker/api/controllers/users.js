'use strict';

const logger = require('../../controller/log')(module)
  , auth = require('../../controller/auth')
  ;

module.exports = {
  get_user_info: get_user_info
};


function get_user_info(req, res, next) {
  auth.authenticated_request(
    'basic',
    req,
    res,
    function(err, user) {
      if(err){
        res.status(401);
        res.write(JSON.stringify({ message: err.message, fields: { error: err } }));
      }
      res.write(JSON.stringify(user));
      res.end();
    }
  );
}
