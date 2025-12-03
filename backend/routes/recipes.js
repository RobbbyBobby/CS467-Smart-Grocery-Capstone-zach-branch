const express = require('express');
const router = express.Router();
const { findRecipesUnified } = require('../services/recipeFinder');


router.get('/', async (req, res) => {
  try {
    const { ingredients, limit = 5 } = req.query;

    if (!ingredients) {
      return res
        .status(400)
        .json({ error: "Query param 'ingredients' is required (comma-separated)" });
    }

    const n = Math.max(1, Math.min(50, Number(limit) || 5));
    const result = await findRecipesUnified(ingredients, n);

    // if the service returns source, items , forwards it
    if (result && typeof result === 'object' && 'items' in result) {
      return res.status(200).json(result);
    }
    const items = Array.isArray(result) ? result : [];
    const source =
      !items.length
        ? 'unknown'
        : (new Set(items.map((x) => x.source || 'unknown')).size === 1
            ? (items[0].source || 'unknown')
            : 'mixed');

    return res.status(200).json({ source, items });
  } catch (err) {
    console.error('GET /recipes failed:', err);
    res
      .status(500)
      .json({ error: 'internal_error', message: err.message });
  }
});

module.exports = router;
