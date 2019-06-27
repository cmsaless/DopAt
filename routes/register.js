const express = require('express');
const {serverLog, errorLog, routeLog} = require('../logs/log');
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const {studentAuthenticated} = require('../functions/authentication');
const {getUserOptions} = require('../functions/helpers');
const router = express.Router();

// user must be logged in as student to view register page
router.all('/*', studentAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'main';

    next();
});

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'main';
    next();
});


router.get('/', (req, res) => {
    res.render('pages/register', {options: getUserOptions(res.locals.user)});
});
// req: what is sent to us
// res: what we send
router.get('/:search', (req, res) =>  {

    Class.find({
        name: { "$regex": req.params.search, "$options": "i"}
    }).populate("professor").exec(function(err, foundClass) {
        if (err) {
            return err;
        }
        else {
            if (foundClass.length == 0) {
                res.send({error: "This computer sucks"})
            }
            else {
                res.send(foundClass);
            }
        }
    })
});


// Exporting the routes to be used in our server.js
module.exports = router;
