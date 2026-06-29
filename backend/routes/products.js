const express = require('express');
const router = express.Router();
const db = require('../database');
const { body, validationResult } = require('express-validator');

// GET semua produk
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY kategori, nama_produk');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET produk by kategori
router.get('/category/:category', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE kategori = ?', [req.params.category]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET semua kategori
router.get('/categories/all', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DISTINCT kategori FROM products ORDER BY kategori');
    res.json(rows.map(r => r.kategori));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah produk baru
router.post('/', async (req, res) => {
  const { nama_produk, kategori, kode_ukuran, harga, stok, min_stok } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (nama_produk, kategori, kode_ukuran, harga, stok, min_stok) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_produk, kategori, kode_ukuran, harga, stok || 0, min_stok || 5]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT edit produk
router.put('/:id', async (req, res) => {
  const { nama_produk, kategori, kode_ukuran, harga, stok, min_stok } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE products SET nama_produk = ?, kategori = ?, kode_ukuran = ?, harga = ?, stok = ?, min_stok = ? WHERE id = ?',
      [nama_produk, kategori, kode_ukuran, harga, stok, min_stok, id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE hapus produk
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah produk dengan validasi
router.post('/', [
  body('nama_produk').notEmpty().trim().escape().withMessage('Nama produk wajib diisi'),
  body('kategori').notEmpty().trim().escape().withMessage('Kategori wajib diisi'),
  body('harga').isInt({ min: 0 }).withMessage('Harga harus angka positif'),
  body('stok').optional().isInt({ min: 0 }).withMessage('Stok harus angka positif'),
  body('min_stok').optional().isInt({ min: 0 }).withMessage('Minimal stok harus angka positif')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { nama_produk, kategori, kode_ukuran, harga, stok, min_stok } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (nama_produk, kategori, kode_ukuran, harga, stok, min_stok) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_produk, kategori, kode_ukuran, harga, stok || 0, min_stok || 5]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET produk dengan stok menipis
router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE stok <= min_stok ORDER BY stok ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET log stok
router.get('/stock-logs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM log_stok ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;