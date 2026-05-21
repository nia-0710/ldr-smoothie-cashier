const express = require('express');
const router = express.Router();
const db = require('../database');

// Save transaction
router.post('/', async (req, res) => {
  const { items, totalAmount, paymentAmount, changeAmount, paymentMethod, cashierName } = req.body;
  const invoiceNumber = `INV-${Date.now()}`;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (invoice_number, total_amount, payment_amount, change_amount, payment_method, cashier_name) VALUES (?, ?, ?, ?, ?, ?)',
      [invoiceNumber, totalAmount, paymentAmount, changeAmount, paymentMethod || 'cash', cashierName || 'Kasir']
    );

    const transactionId = transactionResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO transaction_details (transaction_id, product_id, product_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [transactionId, item.id, item.nama_produk, item.quantity, item.harga, item.subtotal]
      );
    }

    await connection.commit();
    res.json({ success: true, invoiceNumber });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// GET pengeluaran hari ini
router.get('/pengeluaran/hari-ini', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM pengeluaran WHERE tanggal = CURDATE() ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST tambah pengeluaran
router.post('/pengeluaran', async (req, res) => {
  const { keterangan, jumlah, kasir_name } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO pengeluaran (keterangan, jumlah, kasir_name) VALUES (?, ?, ?)',
      [keterangan, jumlah, kasir_name]
    );
    res.json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE hapus pengeluaran
router.delete('/pengeluaran/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM pengeluaran WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ringkasan keuangan kasir hari ini
router.get('/ringkasan/hari-ini', async (req, res) => {
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

module.exports = router;