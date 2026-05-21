const express = require('express');
const router = express.Router();
const db = require('../database');

// Save transaction
router.post('/', async (req, res) => {
  const { items, totalAmount, paymentAmount, changeAmount } = req.body;
  const invoiceNumber = `INV-${Date.now()}`;

  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert transaction
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (invoice_number, total_amount, payment_amount, change_amount) VALUES (?, ?, ?, ?)',
      [invoiceNumber, totalAmount, paymentAmount, changeAmount]
    );

    const transactionId = transactionResult.insertId;

    // Insert transaction details
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

// Get transaction details
router.get('/:id', async (req, res) => {
  try {
    const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    const [details] = await db.query('SELECT * FROM transaction_details WHERE transaction_id = ?', [req.params.id]);
    res.json({ transaction: transaction[0], details });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;