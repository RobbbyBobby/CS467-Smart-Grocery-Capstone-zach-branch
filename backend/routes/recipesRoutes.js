const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/recipes/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM recipes WHERE userId = ?', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
