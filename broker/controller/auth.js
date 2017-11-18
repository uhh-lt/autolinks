
'use strict';

// exports
module.exports = {
  init: init,
  authenticated_request: authenticated_request
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
  user_db.get_user(name, done);
  // user_db.get_user(name, (err, user) => done(err, user) );
});

function verifyUser(username, password, done){
  user_db.get_user(username, function(err, user){
    if (err) {
      logger.warn(`Error while retrieving user ${username}.`, {error: err}, {});
      return done(err);
    }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
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
function authenticated_request(strategy, req, res, next) {
  passport.authenticate(strategy ? strategy : 'local', function(err, user, info) {
    if (err) {
      logger.warn('Authentication failed.', {user: user, info: info, error: err}, {});
      return next(err, null);
    }
    if (!user) {
      logger.debug('No user provided.', {info: info, error: err}, {});
      return next(new Error('Authentication required!'), null);
    }
    req.logIn(user, function(err) {
      if (err) {
        logger.debug(`Authentication failed for user ${user.name}.`, {user: user, info: info, error: err}, {});
        return next(err, null);
      }
      logger.debug(`Access granted ${user.name}.`, {user: user, error: err}, {});
      return next(null, user);
    });
  })(req, res, next);
}




// // =========================================================================
// // LOCAL SIGNUP ============================================================
// // =========================================================================
// // we are using named strategies since we have one for login and one for signup
// // by default, if there was no name, it would just be called 'local'
//
// passport.use('local-signup', new LocalStrategy(
//   function(req, email, password, done) {
//
//     // find a user whose email is the same as the forms email
//     // we are checking to see if the user trying to login already exists
//     connection.query("select * from users where email = '"+email+"'",function(err,rows){
//       console.log(rows);
//       console.log("above row object");
//       if (err)
//         return done(err);
//       if (rows.length) {
//         return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
//       } else {
//
//         // if there is no user with that email
//         // create the user
//         var newUserMysql = new Object();
//
//         newUserMysql.email    = email;
//         newUserMysql.password = password; // use the generateHash function in our user model
//
//         var insertQuery = "INSERT INTO users ( email, password ) values ('" + email +"','"+ password +"')";
//         console.log(insertQuery);
//         connection.query(insertQuery,function(err,rows){
//           newUserMysql.id = rows.insertId;
//
//           return done(null, newUserMysql);
//         });
//       }
//     });
//   }));
//
// // =========================================================================
// // LOCAL LOGIN =============================================================
// // =========================================================================
// // we are using named strategies since we have one for login and one for signup
// // by default, if there was no name, it would just be called 'local'
//
// passport.use('local-login', new LocalStrategy({
//     // by default, local strategy uses username and password, we will override with email
//     usernameField : 'email',
//     passwordField : 'password',
//     passReqToCallback : true // allows us to pass back the entire request to the callback
//   },
//   function(req, email, password, done) { // callback with email and password from our form
//
//     connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'",function(err,rows){
//       if (err)
//         return done(err);
//       if (!rows.length) {
//         return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
//       }
//
//       // if the user is found but the password is wrong
//       if (!( rows[0].password == password))
//         return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
//
//       // all is well, return successful user
//       return done(null, rows[0]);
//
//     });
//
//
//
//   }));