const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Konfigurasi database
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ldr_smoothie',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Routes
const productsRoutes = require('./routes/products');
const transactionsRoutes = require('./routes/transactions');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend LDR_Smoothie berjalan!', status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📝 Login: http://localhost:${PORT}/api/auth/login`);
});