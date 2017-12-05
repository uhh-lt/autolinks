'use strict';

const
  auth = require('../../controller/auth'),
  userdb = require('../../controller/user_db'),
  logger = require('../../controller/log')(module)
  ;

module.exports = {
  get_user_info: getUserInfo,
  register_new_user : registerNewUser,
  delete_user : deleteUser,
  update_user : updateUser,
};


function registerNewUser(req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  const data = req.swagger.params.data.value;
  if(!data){
    res.status(500);
    return res.end(JSON.stringify({ message: 'No user data provided.' }), next);
  }
  if(!data.name || !data.password){
    res.status(500);
    return res.end(JSON.stringify({ message: 'Insufficient information. Please check that a \'name\' and a \'password\' are provided.', fields : { data: data } } ), next);
  }

  // add user
  userdb.add_user(data.name, data.password, function(err, user){
    if (err) {
      res.status(500);
      return res.end(JSON.stringify({message: err.message, fields : { data : data, error : err } }));
    }
    res.end(JSON.stringify(user));
  });
}

function deleteUser(req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.status(500);
  return res.end(JSON.stringify({ message: 'Not yet implemented.' }), next);
}

function updateUser(req, res, next) {
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.status(500);
  return res.end(JSON.stringify({ message: 'Not yet implemented.' }), next);
}

function getUserInfo(req, res) {
  auth.authenticate_request({
      strategy: 'basic',
      req: req,
      res: res,
      next: function (err, user) {
        res.header('Content-Type', 'application/json; charset=utf-8');
        if (err) {
          res.status(401);
          return res.end(JSON.stringify({message: err.message, fields: { error: err.message }}));
        }
        res.end(JSON.stringify(user));
      }
    }
  );
}
