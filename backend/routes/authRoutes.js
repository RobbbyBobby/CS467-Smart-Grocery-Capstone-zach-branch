const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { generateAccessToken, generateRefreshToken, REFRESH_SECRET } = require('../utils/tokenMiddleware.js');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        const sql = `
                INSERT INTO users (username, email, password)
                VALUES (?, ?, ?)
            `;
    
        const [result] = await pool.execute(sql, [
            username,
            email,
            hashed
        ]);

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email or username already exists" });
        }
        return res.status(500).json({ error: err.message });
    }
    
    return res.sendStatus(201);
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Fetch user from DB
    const [rows] = await pool.execute(
        "SELECT userId, username, email, password FROM users WHERE username = ?",
        [username]
    );

    if (rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0]

    // Check user credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { username: user.username, userId: user.userId };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('token', accessToken, { httpOnly: true, sameSite: 'lax' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'lax' });

    res.json({ 
        user: { 
            userId: user.userId,
            username: user.username,
            email: user.email
        },
        message: 'Login successful' });
});

// Refresh token route, fetches from cookies for user validation
router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(403).json({ message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid refresh token' });

        const newAccessToken = generateAccessToken({ user: user.userId });
        res.cookie('token', newAccessToken, { httpOnly: true, sameSite: 'lax' });
        res.json({ message: 'Access token refreshed' });
    });
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', path: '/' });

    res.json({ message: 'Logged out successfully' });
});

module.exports = router;