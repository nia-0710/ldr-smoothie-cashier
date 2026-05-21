const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY kategori, nama_produk');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE kategori = ?', [req.params.category]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT kategori FROM products ORDER BY kategori');
    res.json(rows.map(r => r.kategori));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;