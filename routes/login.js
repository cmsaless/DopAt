// Importing the packages that we will use
const express = require('express');
const User = require('../models/User');
const {getUserOptions} = require('../functions/helpers');
const {serverLog, errorLog, routeLog} = require('../logs/log');

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
    if (res.locals.user) {
        res.render('pages/login', {options: getUserOptions(res.locals.user), adBlocked: "true"});
    }
    else {
        res.render('pages/login', {adBlocked: "true"});
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
    const newUser = new User({
        name: req.body.name,
        email: req.body.email.toLowerCase(),
        password: req.body.pass,
        professor: (req.body.role == "professor") ? true : false
    });

    newUser.save().then(savedUser => {
        res.send(`Created User: ${savedUser.email}`);
    }).catch(err => {
        serverLog('Error saving user to database');
        res.send('Something went wrong');
    });
  }
  const result = req.body.name;
});


router.get('/confirm', (req, res) => {
  const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.pass,
      professor: false
  });

  newUser.save().then(savedUser => {
      res.send(`Created User: ${savedUser.email}`);
  }).catch(err => {
      serverLog('Error saving user to database');
      res.send('Something went wrong');
  });
});

function checkEmail(email){
  var res = email.split("@");
  return (res.length == 2);
}

module.exports = router;
