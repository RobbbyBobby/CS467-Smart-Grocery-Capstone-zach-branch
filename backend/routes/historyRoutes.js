const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/history', async (req, res) => {
  const { userId, itemId, action, quantityChange } = req.body;

  try {
    await pool.execute(
      `INSERT INTO itemHistory (userId, itemId, action, quantityChange) VALUES (?, ?, ?, ?)`,
      [userId, itemId, action, quantityChange]
    );

    res.json({ message: "History entry recorded." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM itemHistory WHERE userId = ?", [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;