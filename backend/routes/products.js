const express = require('express');
const router = express.Router();
const db = require('../database');

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

// POST tambah stok (restock)
router.post('/:id/restock', async (req, res) => {
  const { id } = req.params;
  const { jumlah_tambah, admin_name, keterangan } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Ambil stok sekarang
    const [product] = await connection.query('SELECT nama_produk, stok FROM products WHERE id = ?', [id]);
    const stok_sebelum = product[0].stok;
    const stok_sesudah = stok_sebelum + parseInt(jumlah_tambah);
    
    // Update stok
    await connection.query('UPDATE products SET stok = ? WHERE id = ?', [stok_sesudah, id]);
    
    // Catat log
    await connection.query(
      'INSERT INTO log_stok (product_id, product_name, perubahan, stok_sebelum, stok_sesudah, keterangan, admin_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, product[0].nama_produk, jumlah_tambah, stok_sebelum, stok_sesudah, keterangan || 'Restock', admin_name]
    );
    
    await connection.commit();
    res.json({ success: true, stok_sebelum, stok_sesudah });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
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