const express = require('express');
const router = express.Router();
const db = require('../database');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await db.query(
      'SELECT id, username, role, nama_lengkap FROM users WHERE username = ? AND password = MD5(?)',
      [username, password]
    );
    
    if (rows.length > 0) {
      res.json({ 
        success: true, 
        user: rows[0],
        message: 'Login berhasil!'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Username atau password salah!' 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register (hanya untuk admin)
router.post('/register', async (req, res) => {
  const { username, password, role, nama_lengkap } = req.body;
  
  try {
    await db.query(
      'INSERT INTO users (username, password, role, nama_lengkap) VALUES (?, MD5(?), ?, ?)',
      [username, password, role, nama_lengkap]
    );
    res.json({ success: true, message: 'User berhasil ditambahkan!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;