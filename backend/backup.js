const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfigurasi
const backupDir = path.join(__dirname, 'backups');
const dbName = 'ldr_smoothie';
const dbUser = 'root';
const dbPassword = '';

// Buat folder backup jika belum ada
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
}

function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_${timestamp}.sql`);
  
  const command = `mysqldump -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${backupFile}"`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup error: ${error}`);
      return;
    }
    console.log(`✅ Backup berhasil: ${backupFile}`);
    
    // Hapus backup lama (lebih dari 30 hari)
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > thirtyDays) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Hapus backup lama: ${file}`);
      }
    });
  });
}

// Backup setiap hari jam 01:00
function scheduleBackup() {
  const now = new Date();
  const night = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    1, 0, 0
  );
  const msToMidnight = night.getTime() - now.getTime();
  
  setTimeout(() => {
    backupDatabase();
    setInterval(backupDatabase, 24 * 60 * 60 * 1000);
  }, msToMidnight);
}

// Jalankan
scheduleBackup();
console.log('🔄 Backup scheduler berjalan...');
console.log(`📁 Folder backup: ${backupDir}`);