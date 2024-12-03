// routes/users.js

const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');

// Middleware function to redirect logged-in users to dashboard
const redirectDashboard = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};



// Registration page
router.get('/register', redirectDashboard, (req, res) => {
    res.render('register');
});

// Handle registration
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username or email already exists
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(checkQuery, [username, email], async (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                res.status(400).json({ error: 'Username or email already exists' });
            } else {
                // Hash the password and save the user
                const hashedPassword = await bcrypt.hash(password, 10);
                const insertQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
                db.query(insertQuery, [username, hashedPassword, email], (err, results) => {
                    if (err) throw err;
                    res.status(201).json({ message: 'User registered successfully' });
                });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred during registration' });
    }
});

// Login page
router.get('/login', redirectDashboard, (req, res) => {
    res.render('login');
});

// Handle login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.render('login', { error: "An error occurred" });
        }

        if (results.length === 0) {
            console.log('No user found');
            return res.render('login', { error: "Invalid username or password" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            console.log('Login successful, redirecting to dashboard...');
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email,
            };
            return res.redirect('/dashboard');
        } else {
            console.log('Password mismatch');
            return res.render('login', { error: "Invalid username or password" });
        }
    });
});


router.post('/preferences', (req, res) => {
    const { userId, defaultCity, alertThresholds, notificationPreferences } = req.body;

    const updateQuery = `
        INSERT INTO user_preferences (user_id, default_city, alert_thresholds, notification_preferences)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            default_city = VALUES(default_city), 
            alert_thresholds = VALUES(alert_thresholds),
            notification_preferences = VALUES(notification_preferences)
    `;

    db.query(
        updateQuery,
        [userId, defaultCity, JSON.stringify(alertThresholds), JSON.stringify(notificationPreferences)],
        (err, results) => {
            if (err) {
                console.error('Error updating preferences:', err);
                res.status(500).json({ error: 'Failed to update preferences' });
            } else {
                res.json({ message: 'Preferences updated successfully' });
            }
        }
    );
});


module.exports = router;
