const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT userId, username, email FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
