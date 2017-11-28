'use strict';

const logger = require('../../controller/log')(module)
  , auth = require('../../controller/auth')
  ;

module.exports = {
  get_user_info: get_user_info
};


function get_user_info(req, res) {
  auth.authenticate_request({
      strategy: 'basic',
      req: req,
      res: res,
      next: function (err, user) {
        res.header('Content-Type', 'application/json; charset=utf-8');
        if (err) {
          res.status(401);
          return res.end(JSON.stringify({message: err.message, fields: {error: err}}));
        }
        res.end(JSON.stringify(user));
      }
    }
  );
}
