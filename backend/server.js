const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const { logError, logInfo } = require('./logger');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 5000;

app.use(cors({
  origin: ['http://ldr.local:5173', 'http://localhost:5173'],
  credentials: true
}));
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
// Rate limiting untuk login (5 percobaan dalam 15 menit)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // maksimal 5 percobaan
  message: { error: 'Terlalu banyak percobaan login. Coba lagi setelah 15 menit.' },
  skipSuccessfulRequests: true
});

// Rate limiting umum (100 request per menit)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 100,
  message: { error: 'Terlalu banyak request. Coba lagi nanti.' }
});

// Apply ke route login
app.use('/api/auth/login', loginLimiter);

// Apply ke semua API
app.use('/api/', apiLimiter);

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
// Error handling middleware
app.use((err, req, res, next) => {
  logError(err, `${req.method} ${req.url}`);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📝 Login: http://localhost:${PORT}/api/auth/login`);
});