const express = require('express');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const {getUserOptions} = require('../functions/helpers');
const passport = require('passport');

const router = express.Router();

router.all('/*', (req, res, next) => {
    routeLog(`${req.method} ${req.originalUrl}`);
    req.app.locals.layout = 'main';
    next();
});

router.get('/', (req, res) => {
    if (res.locals.user) {
        res.render('pages/homepage', {options: getUserOptions(res.locals.user)});
    }
    else {
        res.render('pages/homepage');
    }
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect(302, '/login');
});

router.get('/privacy', (req, res) => {
    if (res.locals.user) {
        res.render('pages/privacyPolicy', {options: getUserOptions(res.locals.user), adBlocked: "true"});
    }
    else {
        res.render('pages/privacyPolicy', {adBlocked: "true"});
    }
});


// Exporting the routes to be used in our server.js
module.exports = router;
