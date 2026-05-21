import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductManagement from './ProductManagement';
import SalesChart from './SalesChart';
import AdminKeuangan from './AdminKeuangan';

const API_URL = 'http://localhost:5000/api';

function AdminDashboard({ user, onLogout }) {
  const [dailySummary, setDailySummary] = useState({
    total_penjualan: 0,
    total_transaksi: 0,
    total_cash: 0,
    total_qris: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'cashier', nama_lengkap: '' });

  useEffect(() => {
    fetchDailySummary();
    fetchRecentTransactions();
    fetchTopProducts();
    fetchUsers();
  }, []);

  const fetchDailySummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/summary/daily`);
      setDailySummary(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/transactions`);
      setRecentTransactions(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/top-products`);
      setTopProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, newUser);
      toast.success('User berhasil ditambahkan!');
      setNewUser({ username: '', password: '', role: 'cashier', nama_lengkap: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Gagal menambahkan user');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-4 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-purple-800">🏆 Dashboard Admin</h2>
          <p className="text-gray-700 text-base mt-1">Selamat datang, <span className="font-semibold text-purple-600">{user?.nama_lengkap || 'Administrator'}</span></p>
        </div>
        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">🚪 Logout</button>
      </div>

      {/* Tab Navigasi */}
      <div className="flex gap-2 flex-wrap border-b pb-2">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('transactions')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'transactions' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          🧾 Transaksi
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'products' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          📦 Produk & Stok
        </button>
        <button 
          onClick={() => setActiveTab('chart')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'chart' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          📈 Grafik Penjualan
        </button>
        <button 
          onClick={() => setActiveTab('keuangan')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'keuangan' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          💰 Keuangan
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          👥 Kelola User
        </button>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
              <div className="text-3xl mb-2">💰</div>
              <p className="text-gray-600 text-sm font-medium">Total Penjualan Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(dailySummary?.total_penjualan)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-600 text-sm font-medium">Total Transaksi Hari Ini</p>
              <p className="text-2xl font-bold text-purple-600">{dailySummary?.total_transaksi || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
              <div className="text-3xl mb-2">💵</div>
              <p className="text-gray-600 text-sm font-medium">Pembayaran Tunai</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(dailySummary?.total_cash)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
              <div className="text-3xl mb-2">📱</div>
              <p className="text-gray-600 text-sm font-medium">Pembayaran QRIS</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(dailySummary?.total_qris)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-xl mb-4 text-gray-800">🏆 Top 10 Produk Terlaris</h3>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada data transaksi</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2 hover:bg-purple-50 p-2 rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-purple-600">{idx + 1}.</span>
                      <div>
                        <p className="font-semibold text-gray-800">{product.product_name}</p>
                        <p className="text-sm text-gray-500">{product.total_terjual} terjual</p>
                      </div>
                    </div>
                    <div className="font-bold text-purple-600">{formatPrice(product.total_nominal)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: TRANSAKSI */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="font-bold text-xl mb-4 text-gray-800">📋 Riwayat Transaksi</h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada transaksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Invoice</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Kasir</th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                    <th className="p-3 text-right text-sm font-semibold text-gray-700">Total</th>
                    <th className="p-3 text-center text-sm font-semibold text-gray-700">Metode</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm text-purple-600">{t.invoice_number}</td>
                      <td className="p-3 text-sm text-gray-700">{t.cashier_name || '-'}</td>
                      <td className="p-3 text-sm text-gray-600">{formatDate(t.created_at)}</td>
                      <td className="p-3 text-right text-sm font-semibold text-gray-800">{formatPrice(t.total_amount)}</td>
                      <td className="p-3 text-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${t.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t.payment_method === 'cash' ? '💰 Tunai' : '📱 QRIS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRODUK & STOK */}
      {activeTab === 'products' && (
        <ProductManagement user={user} />
      )}

      {/* TAB 4: GRAFIK PENJUALAN */}
      {activeTab === 'chart' && (
        <SalesChart />
      )}

      {/* TAB 5: KEUANGAN */}
      {activeTab === 'keuangan' && (
        <AdminKeuangan />
      )}

      {/* TAB 6: KELOLA USER */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daftar User */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">👥 Daftar User</h3>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{u.nama_lengkap}</p>
                    <p className="text-sm text-gray-500">@{u.username}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {u.role === 'admin' ? '👑 Admin' : '💼 Kasir'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tambah User */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-800">➕ Tambah User Baru</h3>
            <form onSubmit={handleAddUser}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  placeholder="Masukkan nama lengkap" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" 
                  value={newUser.nama_lengkap} 
                  onChange={e => setNewUser({...newUser, nama_lengkap: e.target.value})} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input 
                  type="text" 
                  placeholder="Masukkan username" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" 
                  value={newUser.username} 
                  onChange={e => setNewUser({...newUser, username: e.target.value})} 
                  required 
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="Masukkan password" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" 
                  value={newUser.password} 
                  onChange={e => setNewUser({...newUser, password: e.target.value})} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Hak Akses</label>
                <select 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-800" 
                  value={newUser.role} 
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="cashier">💼 Kasir</option>
                  <option value="admin">👑 Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 transition">
                + Tambah User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;