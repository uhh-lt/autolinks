
'use strict';

// exports
module.exports = {
  init: init,
  authenticate_request: authenticate_request,
  handle_authenticated_request: handle_authenticated_request,
};


// requires
const
  passport = require('passport'),
  user_db = require('./user_db'),
  logger = require('./log')(module)
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
    done(null, user);
  });
}

// authenticate with LocalStrategy
passport.use(new LocalStrategy(verifyUser));

// authenticate with BasicStrategy
passport.use(new BasicStrategy(verifyUser));

// initialize passport
function init(app){
  app.use(passport.initialize());
  app.use(passport.session());
}


/**
 *
 * @param req
 * @param res
 * @param next
 * @param strategy
 */
function authenticate_request( { req, res, next, strategy } ) {
  passport.authenticate(strategy ? strategy : 'basic', function(err, user, info) {
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

/**
 *
 * @param req
 * @param res
 * @param next
 * @param strategy (optional)
 */
function handle_authenticated_request(req, res, next, strategy) {
  return authenticate_request({
    req: req,
    res: res,
    next: function (err, user) {
      if (err) {
        res.header('Content-Type', 'application/json; charset=utf-8');
        res.status(401);
        return res.end(JSON.stringify({message: err.message, fields: {error: err}}));
      }
      next(user);
    },
    strategy: strategy
  });
}
