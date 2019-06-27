// Importing the packages that we will use
const express = require('express');
const fs = require('fs');
const User = require('../models/User');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {getUserOptions} = require('../functions/helpers');
const LocalStrategy = require('passport-local').Strategy;

// Creating the router
const router = express.Router();

/* This is middleware that will apply a layout template for routes that fit
   the /* definition.
   This will be appended to whatever route prefix we specified in server.js
   for this file
*/
router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {

    User.findOne({email: email.toLowerCase()}).then(user => {
        if (!user) { 
            return done(null, false, {message: 'No user found'}); 
        }

        bcrypt.compare(password, user.password, (err, matched) => {
            if (err) return err;

            if (matched) {
                return done(null, user);
            }
            else {
                return done(null, false, {message: 'Incorrect password'});
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

router.get('/', (req, res) => {
    if (res.locals.user) {
        res.render('pages/signup', {options: getUserOptions(res.locals.user), adBlocked: "true"});
    }
    else {
        res.render('pages/signup', {adBlocked: "true"});
    }
});

router.post('/submit', (req, res) => {
  //Checks for missing information, blank submissions will be marked false.
  var missing = "";
  missing += (!req.body.name) ? "| Name " : "";
  missing += (!req.body.email) ? "| Email " : "";
  missing += (!req.body.pass) ? "| Password " : "";
  missing += (!req.body.passConfirm) ? "| Confirmation of Password " : "";
  if(missing != ""){
    res.send("Missing information " + missing);
  }

  //Compare both entered passwords, check for inconsistencies
  if(req.body.pass != req.body.passConfirm){
    res.send("Passwords do not match")
  }

  //Check to make sure email follows semi-formal conventions
  if(!checkEmail(req.body.email)){
    res.send("Invalid email formatting. Please enter email following specified guidleines: 'xxxxxxx@xxx'")
  }
  //All entered information is valid and submission will be made to DB.
  else{
    //Here is where we would make the submission to the database.
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.pass, salt, (err, hash) => {
          const newUser = new User({
              name: req.body.name,
              email: req.body.email.toLowerCase(),
              password: hash,
              professor: (req.body.role == "professor") ? true : false
          });

          newUser.save().then(savedUser => {
            req.flash("successMessage","Signed up successfully, please log in");
            res.redirect(302, '/login');
            //   res.send(`Created User: ${savedUser.email}`);
          }).catch(err => {
              serverLog('Error saving user to database');
              res.send('Something went wrong');
          });
        });
    });

  }
  const result = req.body.name;
});


function checkEmail(email){
  var res = email.split("@");
  return (res.length == 2);
}

router.get('/login', (req, res) => {
  res.render('pages/login')
});

router.post('/login', (req, res, next) => {
    req.flash("errorMessage", "Incorrect email or password");
    passport.authenticate('local', {
        successRedirect: '/signup/redirect',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);

});

/*
This route checks whether user is student or professor 
and will redirect them to the appropriate page
*/
router.get('/redirect', (req, res) => {
    // This is how you can get the user on every page once they log in
    const user = res.locals.user;

    if (user.professor) {
        serverLog(`Login - Professor: ${res.locals.user.id}`);
        res.redirect(302, '/professor/profile');
    }
    else {
        serverLog(`Login - Student: ${res.locals.user.id}`);
        res.redirect(302, '/student/profile');
    }
});

module.exports = router;
