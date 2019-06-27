// Importing the packages that we will use
const express = require('express');
const mongoose = require('mongoose');
// Requiring database Models
const User = require('../models/User');
const Class = require('../models/Class');
const AttendanceCode = require('../models/AttendanceCode');
const FinishedAttendance = require('../models/FinishedAttendance');
const Quiz = require('../models/Quiz');
const Attendance = require('../models/Attendance');
// Requiring special functions
const {serverLog, errorLog, routeLog} = require('../logs/log');
const {classSort, sanitizeString, randomAttendanceCode, getUserOptions} = require('../functions/helpers');
const {professorAuthenticated} = require('../functions/authentication');

const fs = require('fs');

// Creating the router
const router = express.Router();

/* This is middleware that will apply a layout template for routes that fit
   the /* definition.
   This will be appended to whatever route prefix we specified in server.js
   for this file
*/
router.all('/*', professorAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});

// GET /professor/profile
router.get('/profile', (req, res) => {

    // Getting the user from the passed stuff
    const user = res.locals.user;

    // Finding all of their classes
    Class.find({professor: user.id}).then( classes => {
        AttendanceCode.find({professor: user.id}).populate('class').exec(function (err, attendance) {
            Quiz.find({professor: user.id, open: true}).populate('class').exec(function (err, quizzes) {
                res.render('pages/professor/professorProfile', {
                    user: user,
                    classes: classes.sort(classSort),
                    classCount: classes.length,
                    attendance: attendance,
                    quizzes: quizzes,
                    options: getUserOptions(res.locals.user)
                });
            });
            
        });
    }).catch(err => {
        req.flash('errorMessage', 'Error finding professor profile');
        res.redirect(302, '/404');
    });
});

// POST /professor/classes/add
router.post('/classes/add', (req, res) => {
    const profId =res.locals.user._id;
    const className = req.body.className;

    const newClass = new Class({
        name: sanitizeString(className),
        professor: mongoose.Types.ObjectId(profId)
    });

    // Saving the class we just created
    newClass.save().then(savedClass => {
        serverLog(`Class Added: ${savedClass.id}`);
        req.flash('successMessage', `Class Added: ${newClass.name}`);
        res.redirect(302, '/professor/profile');
    }).catch(err => {
        req.flash('errorMessage', 'Error adding class');
        res.redirect(302, '/professor/profile');
    });
});

// GET /professor/manage/{id}
router.get('/manage/:id', (req, res) => {
    const id = req.params.id;req.params.id;

    Class.findById(id).then(result => {
        res.render('pages/professor/profManageClass', {class: result, options: getUserOptions(res.locals.user)});
    }).catch(err => {
        req.flash('errorMessage', 'Error finding class');
        res.redirect(302, '/professor/profile');
    });

});

// GET /professor/delete/{id}
router.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    Class.findOneAndDelete({
        _id: id,
        professor: res.locals.user._id
    }, (err, dataResponse) => {

        if (err) {
            // If there was an error
            req.flash('errorMessage', 'Class unable to be deleted');
            res.redirect(302, '/professor/profile');
        }
        else if (dataResponse) {
            // If the class was actually deleted
            serverLog(`Class Deleted: ${req.params.id}`);
            req.flash('successMessage', `Class Deleted`);
            res.redirect(302, '/professor/profile');
        }
        else {
            // If no class was deleted it's because they don't own a class with that ID
            req.flash('errorMessage', 'You do not own that class, or that class does not exist');
            res.redirect(302, '/professor/profile');
        }
    });
});

router.post('/attendance/start', (req, res) => {
    const user = res.locals.user;

    AttendanceCode.findOneAndDelete({
        class: req.body.class,
        professor: res.locals.user._id
    }, (err, dataResponse) => {

        if (err) {
            // If there was an error
            req.flash('errorMessage', 'Attendance Unable to start');
            res.redirect(302, '/professor/profile');
        }
        else {
            const attendanceCode = new AttendanceCode({
                class: req.body.class,
                professor: user._id,
                code: randomAttendanceCode()
            });

            attendanceCode.save().then(savedAttendanceCode => {
                serverLog(`Attendance Started: ${savedAttendanceCode.id}`);
                res.render('pages/professor/showAttendanceCode', {attendanceCode: savedAttendanceCode, options: getUserOptions(res.locals.user)});
            }).catch(err => {
                req.flash('errorMessage', 'Attendance Code was not able to be created');
                res.redirect(302, '/professor/profile');
            });
        }
    });
});

router.post('/attendance/stop', (req, res) => {
    const user = res.locals.user;
    AttendanceCode.findOne({_id: req.body.attendanceCode}, (err, attCode) => {
        if (err) {
            req.flash('errorMessage', 'Error stopping attendance');
            res.redirect(302, '/professor/profile');
        }

        var finishedAttendance = new FinishedAttendance({
            codeID: attCode._id,
            class: attCode.class,
            professor: attCode._id,
            started: attCode.date,
            closed: new Date(),
            count: 0
        });

        Attendance.find({code: finishedAttendance.codeID}, (err, result) => {
            finishedAttendance.count = result.length;
            if (result.length == 0) {
                finishedAttendance.count = 0;
            }

            finishedAttendance.save().then(savedAttendance => {
                AttendanceCode.findByIdAndRemove(req.body.attendanceCode, (err, attCode) => {
                    if (err) { console.log(err); }
                    req.flash('successMessage', 'Attendance stopped successfully');
                    res.redirect(302, '/professor/profile');
                });

            }).catch(err => {
                console.log(err);
                req.flash('errorMessage', 'Error stopping attendance');
                res.redirect(302, '/professor/profile');
            });

        });

    });
});

router.get('/attendance/view/class/:id', (req, res) => {
    FinishedAttendance.find({class: req.params.id}).then( codes => {
        codes.forEach(item => {
            item.dateString = item.started.toLocaleDateString();
        });

        res.render('pages/professor/classAttendance', {codes: codes, options: getUserOptions(res.locals.user)});

    }).catch(err => {
        console.log(err);
    });
});


router.get('/attendance/view/:id', (req, res) => {
    Attendance.find({ code: req.params.id }).
        populate('student'). // only works if we pushed refs to children
        exec(function (err, person) {
            if (err) {
                console.log(err);
            }
            res.render('pages/professor/viewAttendance', {attendances: person, options: getUserOptions(res.locals.user)});
    });
});

router.get('/attendance/report/:id', (req, res) => {
    const classID = req.params.id;
    
    FinishedAttendance.find({class: classID}).then(attendances => {
        var ids = [];
        var i = 0;
        for (i = 0; i < attendances.length; i++) {
            ids.push(attendances[i].codeID);
        }
        if (i >= attendances.length) {
            Attendance.find({ code: ids })
            .populate('student') // only works if we pushed refs to children
            .exec(function (err, allSingleAttendance) {
                if (err) {
                    console.log(err);
                }

                console.log(allSingleAttendance);
                
                var emails = [];
                var attended = [];
                var final = [];

                for (var i = 0; i < allSingleAttendance.length; i++) {
                    const email = allSingleAttendance[i].student.email;
                    if (emails.indexOf(email) == -1) {
                        emails.push(email);
                        attended.push(1);
                    }
                    else {
                        const loc = emails.indexOf(email);
                        attended[loc] += 1;
                    }
                }
                console.log(emails);
                console.log(attended);
                for (var i = 0; i < emails.length; i++) {
                    var original = attended[i]/attendances.length * 100
                    final.push({
                        email: emails[i],
                        attended: attended[i],
                        percent: Math.round(original * 100)/100 + "%"
                    });
                }
                const result = {
                    total: attendances.length,
                    people: final
                } 
                res.render('pages/professor/attendance_report', {report: result, classID: classID, options: getUserOptions(res.locals.user)});
        
            });
        }
        
    }).catch(err => {
        console.log(err);
        res.send("ERROR");
    });

});

router.get('/attendance/report/csv/:id', (req, res) => {
    const classID = req.params.id;
    
    FinishedAttendance.find({class: classID}).then(attendances => {
        var ids = [];
        var i = 0;
        for (i = 0; i < attendances.length; i++) {
            ids.push(attendances[i].codeID);
        }
        if (i >= attendances.length) {
            Attendance.find({ code: ids })
            .populate('student') // only works if we pushed refs to children
            .exec(function (err, allSingleAttendance) {
                if (err) {
                    console.log(err);
                }
                //console.log(allSingleAttendance);
                var emails = [];
                var attended = [];
                var final = [];

                for (var i = 0; i < allSingleAttendance.length; i++) {
                    const email = allSingleAttendance[i].student.email;
                    if (emails.indexOf(email) == -1) {
                        emails.push(email);
                        attended.push(1);
                    }
                    else {
                        const loc = emails.indexOf(email);
                        attended[loc] += 1;
                    }
                }
                console.log(emails);
                console.log(attended);
                for (var i = 0; i < emails.length; i++) {
                    var original = attended[i]/attendances.length
                    final.push({
                        email: emails[i],
                        attended: attended[i],
                        percent: Math.round(original * 100)/100
                    });
                }
                
                var csv = '';

                final.forEach(record => {
                    csv += record.email + ',' + record.attended + ',' + record.percent + '\n';
                });

                csv.slice(0, -1);
                fs.writeFile(global.__basedir + "/public/csv/report.csv", csv, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    res.redirect(302, '/csv/report.csv');                
                }); 
            });
        }
        
    }).catch(err => {
        console.log(err);
        res.send("ERROR");
    });

});


router.get('/quiz/create/:id', (req, res) => {
  res.render('pages/professor/quizCreate', {classID: req.params.id, options: getUserOptions(res.locals.user)});
});

router.post('/quiz/create', (req, res) => {

    const classID = req.body.classID;
    const professor = res.locals.user.id;
    const question = req.body.question;
    const answers = [
        req.body.correct,
        req.body.wrong1,
        req.body.wrong2,
        req.body.wrong3
    ];

    const quiz = new Quiz({
        class: classID,
        professor: professor,
        question: question,
        answers: answers
    });

    quiz.save().then(savedQuiz => {
        req.flash('successMessage', 'Quiz saved successfully');
        res.redirect(302, '/professor/profile');
    }).catch(err => {
        req.flash('errorMessage', 'Quiz was not saved');
        res.redirect(302, '/professor/profile');
    });
});


router.get('/quiz/view/:id', (req, res) => {
    const classID = req.params.id;
    const profID = res.locals.user.id;

    Quiz.find({class: classID, professor: profID}).then(quizzes => {
        res.render('pages/professor/viewQuizzes', {quizzes: quizzes, options: getUserOptions(res.locals.user)});
    }).catch(err => {
        req.flash('errorMessage', 'Error loading quizzes');
        res.redirect(302, '/professor/profile');
    });
});

router.get('/quiz/open/:id', (req, res) => {
    const quizID = req.params.id;
    const profID = res.locals.user.id;

    Quiz.findOneAndUpdate({_id: quizID}, {open: true}).then(updatedQuiz => {
        req.flash('successMessage', 'Quiz opened successfully');
        res.redirect(302, '/professor/profile');
    }).catch(err => {
        console.log(err);
        req.flash('errorMessage', 'Error opening quiz');
        res.redirect(302, '/professor/profile');
    });
    
});

router.get('/quiz/close/:id', (req, res) => {
    const quizID = req.params.id;
    const profID = res.locals.user.id;

    Quiz.findOneAndUpdate({_id: quizID}, {open: false}).then(updatedQuiz => {
        req.flash('successMessage', 'Quiz closed successfully');
        res.redirect(302, '/professor/profile');
    }).catch(err => {
        req.flash('errorMessage', 'Error closing quiz');
        res.redirect(302, '/professor/profile');
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
