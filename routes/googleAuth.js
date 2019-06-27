// Importing the packages that we will use
const express = require('express');
const User = require('../models/User');
const {serverLog, errorLog, routeLog} = require('../logs/log');

// Creating the router
const router = express.Router();

// Creating the passport object and google strategy
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

// The middleware
router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route that redirects based on Google Auth Login user's professor/student status
router.get('/status', (req, res) => {
    if (res.locals.user.professor === null) {
        res.render('pages/google_choice');
    }
    else if (res.locals.user.professor === true) {
        res.redirect(302, '/professor/profile');
    }
    else {
        res.redirect(302, '/student/profile');
    }
});

router.post('/student', (req, res) => {
    User.updateOne({googleId: res.locals.user.googleId}, {professor: false}, (err, savedUser) => {
        if (err) {
            console.log(err);
            res.send('Error updating to student status');
        }
        req.flash('successMessage', 'Welcome to DopAt ' + res.locals.user.name);
        res.redirect(302, '/student/profile');
    });
});

router.post('/professor', (req, res) => {
    User.updateOne({googleId: res.locals.user.googleId}, {professor: true}, (err, savedUser) => {
        if (err) {
            console.log(err);
            res.send('Error updating to professor status');
        }
        req.flash('successMessage', 'Welcome to DopAt ' + res.locals.user.name);
        res.redirect(302, '/professor/profile');
    });
});

router.get('/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect home.
        // console.log(req.user);
        res.redirect(302, '/google/auth/status');
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:4444/google/auth/callback"
},
function(accessToken, refreshToken, profile, done) {
    // console.log('Working');
    // console.log(profile);
    // console.log("\n");
    User.findOne({ googleId: profile.id }).then(user => {
        // console.log(user);
        if (user != null) {
            return done(null, user);
        }
        // console.log("No User Found, inserting one");
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "ThisIsAFakePassword",
            professor: null
        });

        newUser.save().then(savedUser => {
            // console.log("Saved user");
            // req.flash("successMessage","Signed up successfully, please log in");
            return done(null, savedUser);
        }).catch(err => {
            // console.log("NOT saved user");
            console.log(err);
            // serverLog('Error saving user to database');
            return done(null, user);
        });
        
        // return done(user);
    }).catch(err => {
        // console.log("User not found!!!");
        console.log(err);
        return done(null, profile);
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.googleId);
});
passport.deserializeUser((id, done) => {
    User.find({googleId: id}, (err, user) => {
        done(err, user);
    });
});



module.exports = router;
