module.exports = {

    studentAuthenticated: (req, res, next) => {
        // If user is authenticated and NOT a professor
        if (req.isAuthenticated() && !req.user.professor) {
            return next();
        }
        else {
            req.flash('errorMessage', 'You must be logged in as a student to view that page.');
            return res.redirect('/login');
        }
    },

    professorAuthenticated: (req, res, next) => {
        // If user is authenticated and is a professor
        if (req.isAuthenticated() && req.user.professor) {
            return next();
        }
        else {
            req.flash('errorMessage', 'You must be logged in as a professor to view that page.');
            return res.redirect('/login');
        }
    },

    isUser: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            req.flash('errorMessage', 'You must be logged in to view that page');
            return res.redirect('/login');
        }
    }
  };
