const fs = require('fs');
const path = require('path');

// Buat folder logs jika belum ada
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Fungsi log error
function logError(error, context = '') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [ERROR] ${context}: ${error.message}\n${error.stack}\n---\n`;
  
  console.error(logMessage);
  fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
}

// Fungsi log info
function logInfo(message, data = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [INFO] ${message} ${JSON.stringify(data)}\n`;
  
  console.log(logMessage);
  fs.appendFileSync(path.join(logDir, 'access.log'), logMessage);
}

// Fungsi log transaksi
function logTransaction(transactionData) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [TRANSACTION] ${JSON.stringify(transactionData)}\n`;
  
  fs.appendFileSync(path.join(logDir, 'transactions.log'), logMessage);
}

module.exports = { logError, logInfo, logTransaction };