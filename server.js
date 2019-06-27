/********************************************************************
 * Environment Variables
********************************************************************/
// Setting up our API Keys as environment variables
require('dotenv').config();

/********************************************************************
 * Global Variables
********************************************************************/
// Setting up some helpful global variables
global.__basedir = __dirname;

/********************************************************************
 * Library Includes
********************************************************************/
// The NodeJS server package
const express = require('express');
// Form submission handling package
const bodyParser = require('body-parser');
// MongoDB connection package
const mongoose = require('mongoose');
 // Filepath system built-in
const path = require('path');
// Getting data into HTML templates
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');

// Allowing us to flash data to a single pageview
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


/********************************************************************
 * My File Includes
********************************************************************/
// This lets us import functions directly instead of having to do
// log.serverLog(...) we can do serverLog(...)
const {serverLog, errorLog, routeLog} = require('./logs/log');


/********************************************************************
 * Server Creation & Setup
********************************************************************/
// Creating the express server
const app = express();

// Allowing us to use the body-parser to access info in POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


// Setting up session
app.use(session({
    secret: 'markisbest',
    resave: true,
    saveUninitialized: true
}));
// Allowing us to flash messages
app.use(flash());

// Allowing the server to load static files without us defining a path to them
app.use(express.static(path.join(__dirname, 'public')));

// Registering the helper function for express-handlebars
const {select} = require('./functions/handlebars/handlebarsHelper');
// Using handlebars engine in the app
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    helpers: {
        select: select
    },
    partialsDir: 'views/partials/',
    extname: '.hbs'
}));
// Setting up the file extension that defines handlebars files
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');


// Using the method override
app.use(methodOverride('_method'));

/********************************************************************
 * Database Setup & Connection
********************************************************************/

// Allowing mongoose to use the global promise functionality (resolves an error)
mongoose.Promise = global.Promise;

// Making the database connection to MongoDB
// Database container -> port 27017 -> database "dopat"
// 'mongodb' gets resolved by the internal docker network to the mongodb container
mongoose.connect('mongodb://localhost:27017/dopat', {useNewUrlParser: true})
    .then(db => {
        serverLog('Database connected');
    }).catch(err => {
        serverLog('ERROR - Database not connected');
        errorLog('Database failed to connect\n' + err);
});


/********************************************************************
 * Routing
********************************************************************/
// Local variables middleware

// Adding Passport
app.use(passport.initialize());
app.use(passport.session());


// This lets us use variables across routes
app.use((req, res, next) => {
    // Give the user a variable, make it null if no user
    res.locals.user = req.user || null;
    // A generic success message you can use on the page
    res.locals.successMessage = req.flash('successMessage');
    // A generic error message you can use
    res.locals.errorMessage = req.flash('errorMessage');
    next();
});

const home = require('./routes/index');
app.use('/', home);

const professor = require('./routes/professorProfile');
app.use('/professor', professor);

const student = require("./routes/studentProfile");
app.use("/student", student);

const attendance = require('./routes/attendance');
app.use('/attendance', attendance);


const register = require('./routes/register');
app.use('/register', register)

const signup = require('./routes/signup');
app.use('/signup', signup)

const login = require('./routes/login');
app.use('/login', login)

const googleAuth = require('./routes/googleAuth');
app.use('/google/auth', googleAuth)

const proAccount = require('./routes/proAccount');
app.use('/pro', proAccount)

const quiz = require('./routes/quiz');
app.use('/quiz', quiz)

app.get('*', (req, res) => {
    res.render('pages/errors/404');
});

/********************************************************************
 * Starting the server
********************************************************************/
// Setting the port that our server will use
const port = 4444;

// Starting the server
// Visit the page @ http://localhost:4444
app.listen(port, () => {
    serverLog('Server started');
});
