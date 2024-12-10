// routes/main.js

const express = require("express");
const router = express.Router();

// Middleware function to redirect non-logged-in users to login page
const redirectLogin = (req, res, next) => {
    if (!req.session.user) {
        res.redirect('/login');  // Redirect to the login page if not logged in
    } else {
        next();  // Continue to the next middleware if logged in
    }
};


router.get('/dashboard', redirectLogin, function(req, res) {
    res.render('dashboard');
});


// Handle our routes
router.get('/', function(req, res) {
    if (req.session.user) {
        res.redirect('/');
    } else {
        res.render('index');
    }
});

router.get('/about', function(req, res) {
    res.render('about');
});


// Logout route
router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('./');  // Redirect to home if there's an error
        }
        res.clearCookie('connect.sid');
        res.redirect('./');
    });
});

module.exports = router;
