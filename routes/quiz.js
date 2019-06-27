const express = require('express');
const mongoose = require('mongoose');

const fs = require('fs');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const {classSort, sanitizeString, randomAttendanceCode, getUserOptions} = require('../functions/helpers');
const {professorAuthenticated} = require('../functions/authentication');

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

router.get('/', (req, res) => {
    res.render('pages/quiz')
});

router.get('/:id', (req, res) => {

    const quizID = req.params.id;

    Quiz.findOne({_id: quizID}).then(quiz => {
    //  console.log(quiz);
        res.render('pages/quiz', {quiz: quiz, options: getUserOptions(res.locals.user)});
        //res.render('pages/login')
    }).catch(err => {
        req.flash(quizID, 'Error loading quiz');
        res.redirect(302, '/quiz');
    });
});

router.post('/submit_quiz', (req, res) => {
  req.flash('successMessage', 'Answer Submitted Successfully');
  res.redirect(302, '/student/profile');

    res.send(answer);
});

module.exports = router;
