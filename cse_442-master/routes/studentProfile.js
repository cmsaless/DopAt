const express = require('express');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const User = require('../models/User');
const Class = require('../models/Class');
const Quiz = require('../models/Quiz');
const {studentAuthenticated} = require('../functions/authentication');
const {getUserOptions} = require('../functions/helpers');


const router = express.Router();

router.all('/*', studentAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'main';

    next();
});

router.post('/drop', (req, res) => {
    const auth_user = res.locals.user;
    User.findOne({email: auth_user.email}).then(user => {

        Class.findOne({_id: req.body.id}).then(removeClass => {
            user.classes.remove(
                { _id: req.body.id }
            );
            user.save().then(savedUser => {
                req.flash('successMessage', 'Successfully dropped <b>' +  removeClass.name + '</b>');
                res.redirect(302, '/student/profile');
            })
        });

    }).catch(err => {
        serverLog('Error finding user in database');
        res.send('Error finding user');
    })
});


router.post('/openQuizzes', (req, res) => {
    const auth_user = res.locals.user;
    User.findOne({email: auth_user.email}).then(user => {
            Quiz.find({class: req.body.id}).then(quizzes => {
                res.render('pages/viewOpen', {quizzes: quizzes, options: getUserOptions(res.locals.user)});
            }).catch(err => {
                req.flash('errorMessage', 'Error loading quizzes');
                res.redirect(302, '/professor/profile');
            });

    }).catch(err => {
        serverLog('Error finding user in database');
        res.send('Error finding user');
    })
});

// real function for adding a real class
router.get('/add/:id', (req, res) => {
    const auth_user = res.locals.user;
    User.findOne({email: auth_user.email}).then(user => {

        Class.findOne({_id: req.params.id}).then(joinClass => {
            if (user.classes.length == 0 || user.classes.indexOf(joinClass._id) == -1) {
                user.classes.push(joinClass);
                user.save().then(savedUser => {
                    serverLog(`Student Added Class: User: ${user.id} - Class: ${joinClass.id}`);
                    req.flash('successMessage', 'Added ' + joinClass.name);
                    res.redirect(302, '/student/profile');
                })
            } else {
                req.flash('errorMessage', 'You are already in enrolled in <b>' + joinClass.name + '</b>');
                res.redirect(302, '/register');
            }
        }).catch(err => {
            req.flash('errorMessage', 'Could not find class');
            res.redirect(302, '/student/profile');
        });

    }).catch(err => {
        console.log(err)
        req.flash('errorMessage', 'Could not find user');
        res.redirect(302, '/student/profile');
    });
});

router.get('/profile', (req, res) => {
    const auth_user = res.locals.user;
    User.findOne({email: auth_user.email}).populate('classes').exec(function (err1, user1) {
        if (err1) return handleError(err1);
        res.render('pages/studentProfile', {user: user1, classes: user1.classes, options: getUserOptions(res.locals.user)});
    });
});

router.get('/delete', (req, res) => {
    const auth_user = res.locals.user;
    User.remove({email: auth_user.email}, err => {
        req.flash('successMessage', 'Successfully deleted <b>' +  auth_user.email + '</b>');
        res.redirect(302, '/');
    });
});

// Exporting the routes to be used in our server.js when this file is imported
module.exports = router;
