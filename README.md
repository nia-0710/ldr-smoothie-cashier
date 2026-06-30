# 🍹 LDR Smoothie Cashier System

> **Sistem Informasi Kasir Digital** yang dirancang khusus untuk manajemen penjualan, pencatatan transaksi, dan pengelolaan stok inventaris pada bisnis **LDR Smoothies & Juice**.

![Status](https://img.shields.io/badge/status-production-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## 📋 DAFTAR ISI

- [🚀 Fitur Utama](#-fitur-utama)
- [🛠️ Teknologi](#️-teknologi)
- [💻 Cara Menjalankan](#-cara-menjalankan)
- [🔐 Akun Demo](#-akun-demo)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🐛 Troubleshooting](#-troubleshooting)
- [👩‍💻 Author](#-author)
- [📄 License](#-license)

---

## 🚀 Fitur Utama

| Modul | Fitur | Status |
|-------|-------|--------|
| 🔐 **Autentikasi** | Login multi-level (Admin & Kasir) dengan keamanan bcrypt | ✅ |
| 🧾 **Kasir** | Input pesanan, keranjang belanja, pembayaran Cash/QRIS | ✅ |
| 🖨️ **Nota** | Cetak nota transaksi & cetak ulang nota dari riwayat | ✅ |
| 📦 **Produk & Stok** | CRUD produk, manajemen stok, restock, peringatan stok menipis | ✅ |
| 📊 **Dashboard Admin** | Statistik penjualan, Top 10 produk terlaris, grafik interaktif | ✅ |
| 💰 **Keuangan** | Laporan pemasukan & pengeluaran, saldo akhir, laba/rugi | ✅ |
| 👥 **Manajemen User** | Tambah/edit/hapus user (Admin & Kasir) | ✅ |
| 📈 **Grafik Penjualan** | Harian, Mingguan, Bulanan, Tahunan | ✅ |
| 📱 **Mobile Friendly** | Responsif untuk akses dari HP | ✅ |
| 🔔 **Notifikasi** | Peringatan stok menipis real-time | ✅ |

---

## 🛠️ Teknologi

### Frontend
| Teknologi | Fungsi |
|-----------|--------|
| **React.js** | Library UI interaktif |
| **Tailwind CSS** | Styling modern & responsif |
| **Vite** | Build tool cepat |
| **Axios** | HTTP client untuk API |
| **React Hot Toast** | Notifikasi real-time |

### Backend
| Teknologi | Fungsi |
|-----------|--------|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Framework web API |
| **MySQL** | Database relasional |
| **bcrypt** | Hashing password (keamanan) |
| **express-validator** | Validasi input |
| **express-rate-limit** | Proteksi brute force |

---

## 💻 Cara Menjalankan

### 1️⃣ Prasyarat

Pastikan laptop/komputer Anda sudah terinstal:

| Software | Link Download | Keterangan |
|----------|---------------|------------|
| **Node.js** | [Download](https://nodejs.org/) | Minimal versi 16.x |
| **XAMPP** | [Download](https://www.apachefriends.org/) | Untuk MySQL Server |
| **Git** | [Download](https://git-scm.com/) | Untuk clone repository |
| **VS Code** | [Download](https://code.visualstudio.com/) | Editor kode (opsional) |

---

### 2️⃣ Clone Repository

```bash
git clone https://github.com/nia-0710/ldr-smoothie-cashier.git
cd ldr-smoothie-cashier
