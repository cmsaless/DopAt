// Importing the packages that we will use
const express = require('express');
const User = require('../models/User');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const {getUserOptions} = require('../functions/helpers');
const {isUser} = require('../functions/authentication');

// Creating the router
const router = express.Router();


// The middleware
router.all('/*', isUser, (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});

router.get('/', (req, res) => {
    res.render('pages/go_pro', {options: getUserOptions(res.locals.user)});
});

router.post('/checkout', (req, res) => {
    console.log(req.body.stripeEmail)

    if (req.body.stripeEmail === null) {
        req.flash('errorMessage', 'Nice try!');
        req.redirect(302, '/signup/redirect');
    }

    User.findByIdAndUpdate({_id: res.locals.user.id}, {pro: true}, (err, savedUser) => {
        if (err) {
            console.log(err);
            req.flash('errorMessage', 'Something went wrong');
            res.redirect(302, '/pro');
        }

        req.flash('successMessage', 'Thank you for your support, you are now a PRO user!');

        if (req.user.professor) {
            res.redirect(302, '/professor/profile');
        }
        else {
            res.redirect(302, '/student/profile');
        }
    }); 
    
});

router.post('/steal-pro', (req, res) => {

    User.findByIdAndUpdate({_id: res.locals.user.id}, {pro: true}, (err, savedUser) => {
        if (err) {
            console.log(err);
            req.flash('errorMessage', 'Something went wrong');
            res.redirect(302, '/pro');
        }

        req.flash('successMessage', 'We know what you did, you Pro Account thief!');

        if (req.user.professor) {
            res.redirect(302, '/professor/profile');
        }
        else {
            res.redirect(302, '/student/profile');
        }
    });


    
    
});



module.exports = router;
