const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
const productsRoutes = require('./routes/products');
const transactionsRoutes = require('./routes/transactions');

app.use('/api/products', productsRoutes);
app.use('/api/transactions', transactionsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});