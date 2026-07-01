CREATE DATABASE ldr_smoothie;
USE ldr_smoothie;

-- Tabel produk
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama_produk VARCHAR(100) NOT NULL,
    kategori VARCHAR(50) NOT NULL,
    kode_ukuran VARCHAR(50),
    harga INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel transaksi
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount INT NOT NULL,
    payment_amount INT,
    change_amount INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel detail transaksi
CREATE TABLE transaction_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id INT,
    product_id INT,
    product_name VARCHAR(100),
    quantity INT,
    price INT,
    subtotal INT,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);
-- Tambah tabel users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier') DEFAULT 'cashier',
    nama_lengkap VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tambah kolom payment_method di transactions (jika belum)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cashier_name VARCHAR(100);

-- Insert user default
INSERT INTO users (username, password, role, nama_lengkap) VALUES
('admin', MD5('admin123'), 'admin', 'Administrator'),
('kasir1', MD5('kasir123'), 'cashier', 'Kasir 1'),
('kasir2', MD5('kasir123'), 'cashier', 'Kasir 2');

-- Insert data produk dari file Excel
INSERT INTO products (nama_produk, kategori, kode_ukuran, harga) VALUES
('Jus Wortel', 'Jus', 'Kecil (K)', 5000),
('Jus Wortel', 'Jus', 'Besar (B)', 8000),
('Jus Jeruk', 'Jus', 'Kecil (K)', 5000),
('Jus Jeruk', 'Jus', 'Besar (B)', 8000),
('Jus Jambu', 'Jus', 'Kecil (K)', 5000),
('Jus Jambu', 'Jus', 'Besar (B)', 8000),
('Jus Pisang', 'Jus', 'Kecil (K)', 7000),
('Jus Pisang', 'Jus', 'Besar (B)', 10000),
('Jus Semangka', 'Jus', 'Kecil (K)', 7000),
('Jus Semangka', 'Jus', 'Besar (B)', 10000),
('Jus Pepaya', 'Jus', 'Kecil (K)', 7000),
('Jus Pepaya', 'Jus', 'Besar (B)', 10000),
('Jus Belimbing', 'Jus', 'Kecil (K)', 7000),
('Jus Belimbing', 'Jus', 'Besar (B)', 10000),
('Jus Melon', 'Jus', 'Kecil (K)', 8000),
('Jus Melon', 'Jus', 'Besar (B)', 11000),
('Jus Nanas', 'Jus', 'Kecil (K)', 8000),
('Jus Nanas', 'Jus', 'Besar (B)', 11000),
('Jus Strawberry', 'Jus', 'Kecil (K)', 8000),
('Jus Strawberry', 'Jus', 'Besar (B)', 11000),
('Jus Sirsak', 'Jus', 'Kecil (K)', 8000),
('Jus Sirsak', 'Jus', 'Besar (B)', 11000),
('Jus Pir', 'Jus', 'Kecil (K)', 8000),
('Jus Pir', 'Jus', 'Besar (B)', 11000),
('Jus Apel', 'Jus', 'Kecil (K)', 10000),
('Jus Apel', 'Jus', 'Besar (B)', 13000),
('Jus Mangga', 'Jus', 'Kecil (K)', 10000),
('Jus Mangga', 'Jus', 'Besar (B)', 13000),
('Jus Alpukat', 'Jus', 'Kecil (K)', 10000),
('Jus Alpukat', 'Jus', 'Besar (B)', 13000),
('Jus Buah Naga', 'Jus', 'Kecil (K)', 10000),
('Jus Buah Naga', 'Jus', 'Besar (B)', 13000),
('Jus Lemon', 'Jus', 'Kecil (K)', 10000),
('Jus Lemon', 'Jus', 'Besar (B)', 13000),
('Jus Kiwi', 'Jus', 'Kecil (K)', 10000),
('Jus Kiwi', 'Jus', 'Besar (B)', 13000),
('Jus Anggur', 'Jus', 'Kecil (K)', 10000),
('Jus Anggur', 'Jus', 'Besar (B)', 13000),
('Jus Durian', 'Jus', 'Kecil (K)', 12000),
('Jus Durian', 'Jus', 'Besar (B)', 15000),
('Jus Mix 2 Buah', 'Jus', 'Kecil (K)', 10000),
('Jus Mix 2 Buah', 'Jus', 'Besar (B)', 13000),
('Jus Mix 3 Buah', 'Jus', 'Kecil (K)', 12000),
('Jus Mix 3 Buah', 'Jus', 'Besar (B)', 15000),
('Jus Mix 4 Buah', 'Jus', 'Kecil (K)', 14000),
('Jus Mix 4 Buah', 'Jus', 'Besar (B)', 17000),
('Smoothie Buah Naga', 'Smoothie', 'Small (S)', 13000),
('Smoothie Buah Naga', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Buah Naga', 'Smoothie', 'Large (L)', 17000),
('Smoothie Mangga', 'Smoothie', 'Small (S)', 13000),
('Smoothie Mangga', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Mangga', 'Smoothie', 'Large (L)', 17000),
('Smoothie Alpukat', 'Smoothie', 'Small (S)', 13000),
('Smoothie Alpukat', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Alpukat', 'Smoothie', 'Large (L)', 17000),
('Smoothie Anggur', 'Smoothie', 'Small (S)', 13000),
('Smoothie Anggur', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Anggur', 'Smoothie', 'Large (L)', 17000),
('Smoothie Melon', 'Smoothie', 'Small (S)', 13000),
('Smoothie Melon', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Melon', 'Smoothie', 'Large (L)', 17000),
('Smoothie Strawberry', 'Smoothie', 'Small (S)', 13000),
('Smoothie Strawberry', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Strawberry', 'Smoothie', 'Large (L)', 17000),
('Smoothie Cokelat', 'Smoothie', 'Small (S)', 13000),
('Smoothie Cokelat', 'Smoothie', 'Medium (M)', 15000),
('Smoothie Cokelat', 'Smoothie', 'Large (L)', 17000),
('Smoothie Durian', 'Smoothie', 'Large (L)', 20000),
('Es Teler Original', 'Es Teler', 'Std', 10000),
('Es Teler Es Krim', 'Es Teler', 'Std', 15000),
('Es Teler Durian', 'Es Teler', 'Std', 15000),
('Alpukat Cokelat', 'Cokelat', 'Medium (M)', 15000),
('Salad buah', 'Salad', '300 ml (K)', 15000),
('Salad Buah', 'Salad', '500 ml (B)', 20000),
('Sop Buah Original', 'Es', 'Std', 15000),
('Sop Buah Durian', 'Es', 'Std', 20000);