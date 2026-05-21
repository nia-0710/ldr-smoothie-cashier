import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

function ProductManagement({ user }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockNote, setRestockNote] = useState('');
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: '',
    kode_ukuran: '',
    harga: '',
    stok: '0',
    min_stok: '5'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLowStock();
    fetchStockLogs();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/categories/all`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLowStock = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/low-stock`);
      setLowStockProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStockLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/products/stock-logs`);
      setStockLogs(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, formData);
        toast.success('Produk berhasil diupdate!');
      } else {
        await axios.post(`${API_URL}/products`, formData);
        toast.success('Produk berhasil ditambahkan!');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus produk "${nama}"?`)) {
      try {
        await axios.delete(`${API_URL}/products/${id}`);
        toast.success('Produk dihapus!');
        fetchProducts();
      } catch (error) {
        toast.error('Gagal menghapus produk');
      }
    }
  };

  const handleRestock = async () => {
    if (!restockAmount || parseInt(restockAmount) <= 0) {
      toast.error('Masukkan jumlah stok yang valid!');
      return;
    }

    try {
      await axios.post(`${API_URL}/products/${selectedProduct.id}/restock`, {
        jumlah_tambah: restockAmount,
        admin_name: user.nama_lengkap,
        keterangan: restockNote || 'Tambah stok'
      });
      toast.success(`Stok ${selectedProduct.nama_produk} bertambah ${restockAmount}!`);
      setShowRestockModal(false);
      setRestockAmount('');
      setRestockNote('');
      setSelectedProduct(null);
      fetchProducts();
      fetchLowStock();
      fetchStockLogs();
    } catch (error) {
      toast.error('Gagal menambah stok');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      nama_produk: '',
      kategori: '',
      kode_ukuran: '',
      harga: '',
      stok: '0',
      min_stok: '5'
    });
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nama_produk: product.nama_produk,
      kategori: product.kategori,
      kode_ukuran: product.kode_ukuran || '',
      harga: product.harga,
      stok: product.stok,
      min_stok: product.min_stok
    });
    setShowModal(true);
  };

  const getStockStatus = (stok, min_stok) => {
    if (stok <= 0) return <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">HABIS</span>;
    if (stok <= min_stok) return <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">MENIPIS</span>;
    return <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">AMAN</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header - Tanpa teks deskripsi */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-800">📦 Manajemen Produk & Stok</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          + Tambah Produk Baru
        </button>
      </div>

      {/* Peringatan Stok Menipis */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-2xl mr-3">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 text-lg">Peringatan Stok Menipis!</h3>
              <p className="text-sm text-yellow-700 mb-2">Berikut produk yang stoknya sudah hampir habis. Segera lakukan restock!</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                {lowStockProducts.slice(0, 8).map(p => (
                  <div key={p.id} className="bg-white rounded p-2 text-sm shadow-sm">
                    <div className="font-semibold text-gray-800">{p.nama_produk}</div>
                    <div className="text-gray-500 text-xs">{p.kode_ukuran || 'Standard'}</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-red-600 font-bold">Stok: {p.stok}</span>
                      <button
                        onClick={() => { setSelectedProduct(p); setShowRestockModal(true); }}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                      >
                        Tambah Stok
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 8 && (
                <p className="text-xs text-yellow-600 mt-2">+ {lowStockProducts.length - 8} produk lainnya</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabel Produk */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nama Produk</th>
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-left">Ukuran</th>
                <th className="px-4 py-3 text-right">Harga</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-800">{product.nama_produk}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                      {product.kategori}
                    </span>
                   </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.kode_ukuran || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatPrice(product.harga)}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">{product.stok}</td>
                  <td className="px-4 py-3 text-center">{getStockStatus(product.stok, product.min_stok)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        title="Edit Produk"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setSelectedProduct(product); setShowRestockModal(true); }}
                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        title="Tambah Stok"
                      >
                        Stok
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.nama_produk)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        title="Hapus Produk"
                      >
                        Hapus
                      </button>
                    </div>
                   </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riwayat Log Stok */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="font-bold text-xl mb-4 text-gray-800">📜 Riwayat Perubahan Stok</h3>
        {stockLogs.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada riwayat perubahan stok</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-700">Tanggal</th>
                  <th className="px-3 py-2 text-left text-gray-700">Nama Produk</th>
                  <th className="px-3 py-2 text-center text-gray-700">Tambah</th>
                  <th className="px-3 py-2 text-center text-gray-700">Stok Sebelum</th>
                  <th className="px-3 py-2 text-center text-gray-700">Stok Sesudah</th>
                  <th className="px-3 py-2 text-left text-gray-700">Keterangan</th>
                  <th className="px-3 py-2 text-left text-gray-700">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">{log.product_name}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                        +{log.perubahan}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-600">{log.stok_sebelum}</td>
                    <td className="px-3 py-2 text-center font-bold text-gray-800">{log.stok_sesudah}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{log.keterangan}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{log.admin_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editingProduct ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.nama_produk} onChange={e => setFormData({...formData, nama_produk: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <input type="text" list="categories" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.kategori} onChange={e => setFormData({...formData, kategori: e.target.value})} required />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ukuran (opsional)</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.kode_ukuran} onChange={e => setFormData({...formData, kode_ukuran: e.target.value})} placeholder="Contoh: Kecil (K), Medium (M)" />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.harga} onChange={e => setFormData({...formData, harga: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.stok} onChange={e => setFormData({...formData, stok: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimal Stok (Peringatan)</label>
                <input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={formData.min_stok} onChange={e => setFormData({...formData, min_stok: e.target.value})} />
                <p className="text-xs text-gray-500 mt-1">Jika stok di bawah angka ini, akan muncul peringatan</p>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Restock */}
      {showRestockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">📦 Tambah Stok Produk</h3>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-semibold text-gray-800">{selectedProduct.nama_produk}</p>
              <p className="text-sm text-gray-500">{selectedProduct.kode_ukuran || 'Standard'}</p>
              <p className="text-sm mt-1">Stok saat ini: <strong className="text-blue-600">{selectedProduct.stok}</strong></p>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah yang Ditambahkan *</label>
              <input type="number" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={restockAmount} onChange={e => setRestockAmount(e.target.value)} placeholder="Masukkan jumlah stok yang ditambah" autoFocus />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
              <input type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" value={restockNote} onChange={e => setRestockNote(e.target.value)} placeholder="Contoh: Restock mingguan" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleRestock} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">Tambah Stok</button>
              <button onClick={() => { setShowRestockModal(false); setRestockAmount(''); setSelectedProduct(null); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;