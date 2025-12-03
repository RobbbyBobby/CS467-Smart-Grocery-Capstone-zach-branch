const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create an item
router.post('/items', async (req, res) => {
  const { userId, itemName, itemQuantity, categoryId, barcode, expiryDate, units, state } = req.body;

  try {
    const sql = `
      INSERT INTO items (userId, itemName, itemQuantity, categoryId, barcode, expiryDate, units, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.execute(sql, [userId, itemName, itemQuantity, categoryId, barcode, expiryDate, units, state]);

    res.json({ message: "Item added." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all items for a user
router.get('/items/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM items WHERE userId = ?", [req.params.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
