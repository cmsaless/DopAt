const express = require('express');
const Attendance = require('../models/Attendance');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const User = require('../models/User');

const AttendanceCode = require('../models/AttendanceCode');
const {studentAuthenticated} = require('../functions/authentication');
const {getUserOptions} = require('../functions/helpers');
const router = express.Router();

router.all('/*', studentAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});


router.get('/:id', (req, res) => {

     const user = res.locals.user; // do i need a seperate user for this since user is already assigned?

     res.render('pages/attendance', {class: req.params.id, options: getUserOptions(res.locals.user)});
});

router.post('/submit', (req, res) => {

  const Attendance_Code = req.body.AttendanceCode;
  const user = res.locals.user;

  const newAttendance = new Attendance({
      student: user.id,
      class: req.body.classID
  });
  AttendanceCode.findOne({code: Attendance_Code}).then(codeObj => {
    newAttendance.code = codeObj.id;
    newAttendance.save().then(savedAttendance => {
        serverLog(`Attendance Submitted: User: ${res.locals.user.id} - Class: ${req.body.classID}`);
        req.flash('successMessage', `You have been marked present`); // maybe we could improve the message to
                                                        // let you know what class it was added too.
        res.redirect(302, '/student/profile');

    }).catch(err => {
      req.flash('errorMessage', 'Error saving attendance');
      res.redirect(302, '/student/profile');
    });
  }).catch(err => {
    req.flash('errorMessage', 'Incorrect attendance code');
    res.redirect(302, '/student/profile');
  });

});



// Exporting the routes to be used in our server.js
module.exports = router;
