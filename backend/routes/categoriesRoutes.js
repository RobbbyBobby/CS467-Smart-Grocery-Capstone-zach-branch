const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/categories', async (_, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM foodCategory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
