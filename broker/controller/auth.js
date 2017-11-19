
'use strict';

// exports
module.exports = {
  init: init,
  authenticated_request: authenticate_request
};


// requires
const passport = require('passport')
  , user_db = require('./user_db')
  , logger = require('./log')(module)
  // , bcrypt = require('bcrypt')
;

const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
  done(null, user.name);
});

// used to deserialize the user
passport.deserializeUser(function(username, done) {
  user_db.get_user(name, (err, user) => {
    if(err){
      logger.error('Could not get user.', err, {});
      return done(err, null);
    }
    if(!user){
      logger.error(`User ${username} not found.`, err, {});
      return done(err, null);
    }
    return done(null, user);
  } );
});

function verifyUser(username, password, done){
  user_db.get_user(username, function(err, user){
    if (err) {
      logger.warn(`Error while retrieving user ${username}.`, {error: err}, {});
      return done(err, null);
    }
    if (!user) {
      return done(new Error('Unknown username.'), false);
    }
    if (user.password !== password) {
      // TODO: check if user active
      return done(new Error('Incorrect password.'), false);
    }
    // TODO: update user (lastseen)
    return done(null, user);
  });
}

// authenticate with LocalStrategy
passport.use(new LocalStrategy(verifyUser));

// authenticate with BasicStrategy
passport.use(new BasicStrategy(verifyUser));


function init(app){
  app.use(passport.initialize());
  app.use(passport.session());
}


/**
 *
 * @param strategy
 * @param req
 * @param res
 * @param next
 */
function authenticate_request( { strategy, req, res, next } ) {
  passport.authenticate(strategy ? strategy : 'local', function(err, user, info) {
    if (err) {
      logger.warn('Authentication failed.', {user: user, info: info, error: err}, {});
      return next(err, null);
    }
    if (!user) {
      logger.debug('Unauthenticated access attempt.', {info: info, error: err}, {});
      return next(new Error(`Authentication required!`), null);
    }
    req.logIn(user, function(err) {
      if (err) {
        logger.debug(`Authentication failed for user ${user.name}.`, {user: user, info: info, error: err}, {});
        return next(err, null);
      }
      logger.debug(`Access granted ${user.name}.`, { user: user, info: info } );
      return next(null, user);
    });
  })(req, res, next);
}
