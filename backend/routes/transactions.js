const express = require('express');
const router = express.Router();
const db = require('../database');

// Save transaction with stock validation
router.post('/', async (req, res) => {
  const { items, totalAmount, paymentAmount, changeAmount, paymentMethod, cashierName } = req.body;
  const invoiceNumber = `INV-${Date.now()}`;

  // VALIDASI: Keranjang tidak boleh kosong
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Keranjang kosong!' });
  }

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // CEK STOK SEBELUM TRANSAKSI
    for (const item of items) {
      const [product] = await connection.query(
        'SELECT stok, nama_produk FROM products WHERE id = ?', 
        [item.id]
      );
      
      if (product.length === 0) {
        throw new Error(`Produk tidak ditemukan! (ID: ${item.id})`);
      }
      
      if (product[0].stok < item.quantity) {
        throw new Error(`Stok ${product[0].nama_produk} tidak mencukupi! (Sisa: ${product[0].stok}, Diminta: ${item.quantity})`);
      }
    }

    // Insert transaction
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (invoice_number, total_amount, payment_amount, change_amount, payment_method, cashier_name) VALUES (?, ?, ?, ?, ?, ?)',
      [invoiceNumber, totalAmount, paymentAmount || totalAmount, changeAmount || 0, paymentMethod || 'cash', cashierName || 'Kasir']
    );

    const transactionId = transactionResult.insertId;

    // Insert transaction details & UPDATE STOK
    for (const item of items) {
      await connection.query(
        'INSERT INTO transaction_details (transaction_id, product_id, product_name, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [transactionId, item.id, item.nama_produk, item.quantity, item.harga, item.subtotal]
      );
      
      // KURANGI STOK
      await connection.query(
        'UPDATE products SET stok = stok - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    await connection.commit();
    res.json({ success: true, invoiceNumber });
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error.message);
    res.status(400).json({ error: error.message });
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

// Get pengeluaran hari ini
router.get('/pengeluaran/hari-ini', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pengeluaran WHERE tanggal = CURDATE() ORDER BY created_at DESC');
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
    const [penjualan] = await db.query(`
      SELECT 
        SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END) as total_cash,
        SUM(CASE WHEN payment_method = 'qris' THEN total_amount ELSE 0 END) as total_qris,
        SUM(total_amount) as total_penjualan
      FROM transactions 
      WHERE DATE(created_at) = CURDATE()
    `);
    
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