const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all users
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, role, nama_lengkap, created_at FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions with details
router.get('/transactions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, 
             COUNT(td.id) as total_items 
      FROM transactions t
      LEFT JOIN transaction_details td ON t.id = td.transaction_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily summary
router.get('/summary/daily', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) as tanggal,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan,
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as total_cash,
        SUM(CASE WHEN payment_method = 'qris' THEN total_amount ELSE 0 END) as total_qris
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
      GROUP BY DATE(created_at)
    `);
    res.json(rows[0] || { total_transaksi: 0, total_penjualan: 0, total_cash: 0, total_qris: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly summary
router.get('/summary/monthly', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) as tanggal,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan
      FROM transactions
      WHERE MONTH(created_at) = MONTH(CURDATE())
      GROUP BY DATE(created_at)
      ORDER BY tanggal DESC
      LIMIT 30
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top products
router.get('/top-products', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        product_name,
        SUM(quantity) as total_terjual,
        SUM(subtotal) as total_nominal
      FROM transaction_details
      GROUP BY product_name
      ORDER BY total_terjual DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET grafik penjualan harian (7 hari terakhir)
router.get('/chart/daily', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) as tanggal,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan
      FROM transactions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY tanggal ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET grafik penjualan mingguan (4 minggu terakhir)
router.get('/chart/weekly', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        CONCAT('Minggu ke-', WEEK(created_at, 1)) as minggu,
        YEAR(created_at) as tahun,
        WEEK(created_at, 1) as week_num,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan
      FROM transactions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
      GROUP BY YEAR(created_at), WEEK(created_at, 1)
      ORDER BY tahun ASC, week_num ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET grafik penjualan bulanan (12 bulan terakhir)
router.get('/chart/monthly', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as bulan,
        MONTHNAME(created_at) as nama_bulan,
        YEAR(created_at) as tahun,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan
      FROM transactions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(created_at), MONTH(created_at)
      ORDER BY tahun ASC, MONTH(created_at) ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET grafik penjualan tahunan (5 tahun terakhir)
router.get('/chart/yearly', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        YEAR(created_at) as tahun,
        COUNT(*) as total_transaksi,
        SUM(total_amount) as total_penjualan
      FROM transactions
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)
      GROUP BY YEAR(created_at)
      ORDER BY tahun ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ==================== FITUR KEUANGAN UNTUK ADMIN ====================

// GET ringkasan keuangan hari ini
router.get('/keuangan/hari-ini', async (req, res) => {
  try {
    // Total penjualan hari ini
    const [penjualan] = await db.query(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as total_cash,
        SUM(CASE WHEN payment_method = 'qris' THEN total_amount ELSE 0 END) as total_qris,
        SUM(total_amount) as total_penjualan
      FROM transactions 
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // Total pengeluaran hari ini
    const [pengeluaran] = await db.query(`
      SELECT SUM(jumlah) as total_pengeluaran FROM pengeluaran WHERE tanggal = CURDATE()
    `);
    
    res.json({
      penjualan: {
        cash: penjualan[0]?.total_cash || 0,
        qris: penjualan[0]?.total_qris || 0,
        total: penjualan[0]?.total_penjualan || 0
      },
      pengeluaran: {
        total: pengeluaran[0]?.total_pengeluaran || 0
      },
      saldo_akhir: (penjualan[0]?.total_penjualan || 0) - (pengeluaran[0]?.total_pengeluaran || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ringkasan keuangan per periode
router.get('/keuangan/periode', async (req, res) => {
  const { start_date, end_date } = req.query;
  try {
    // Penjualan per periode
    const [penjualan] = await db.query(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as total_cash,
        SUM(CASE WHEN payment_method = 'qris' THEN total_amount ELSE 0 END) as total_qris,
        SUM(total_amount) as total_penjualan,
        COUNT(*) as total_transaksi
      FROM transactions 
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [start_date, end_date]);
    
    // Pengeluaran per periode
    const [pengeluaran] = await db.query(`
      SELECT SUM(jumlah) as total_pengeluaran, COUNT(*) as total_item
      FROM pengeluaran 
      WHERE tanggal BETWEEN ? AND ?
    `, [start_date, end_date]);
    
    res.json({
      penjualan: {
        cash: penjualan[0]?.total_cash || 0,
        qris: penjualan[0]?.total_qris || 0,
        total: penjualan[0]?.total_penjualan || 0,
        transaksi: penjualan[0]?.total_transaksi || 0
      },
      pengeluaran: {
        total: pengeluaran[0]?.total_pengeluaran || 0,
        item: pengeluaran[0]?.total_item || 0
      },
      saldo_akhir: (penjualan[0]?.total_penjualan || 0) - (pengeluaran[0]?.total_pengeluaran || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET semua pengeluaran (dengan filter tanggal)
router.get('/pengeluaran', async (req, res) => {
  const { start_date, end_date } = req.query;
  let query = `
    SELECT p.*, u.nama_lengkap as admin_name 
    FROM pengeluaran p
    LEFT JOIN users u ON p.kasir_name = u.nama_lengkap
    WHERE 1=1
  `;
  let params = [];
  
  if (start_date && end_date) {
    query += ` AND p.tanggal BETWEEN ? AND ?`;
    params = [start_date, end_date];
  }
  
  query += ` ORDER BY p.created_at DESC`;
  
  try {
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET grafik keuangan (pemasukan vs pengeluaran)
router.get('/keuangan/grafik', async (req, res) => {
  const { periode, tahun } = req.query;
  try {
    let query = '';
    if (periode === 'harian') {
      query = `
        SELECT 
          DATE(created_at) as tanggal,
          SUM(total_amount) as pemasukan,
          0 as pengeluaran
        FROM transactions 
        WHERE MONTH(created_at) = MONTH(CURDATE())
        GROUP BY DATE(created_at)
      `;
    } else if (periode === 'bulanan') {
      query = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as bulan,
          SUM(total_amount) as pemasukan,
          0 as pengeluaran
        FROM transactions 
        WHERE YEAR(created_at) = ?
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      `;
    }
    
    const [rows] = await db.query(query, [tahun || new Date().getFullYear()]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;