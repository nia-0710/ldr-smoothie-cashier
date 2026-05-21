import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

function CashierDashboard({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('cashier');
  
  // State untuk Keuangan
  const [ringkasan, setRingkasan] = useState({
    penjualan: { cash: 0, qris: 0, total: 0 },
    pengeluaran: { total: 0 },
    saldo_akhir: 0
  });
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [showPengeluaranModal, setShowPengeluaranModal] = useState(false);
  const [formPengeluaran, setFormPengeluaran] = useState({ keterangan: '', jumlah: '' });
  const [refreshKeuangan, setRefreshKeuangan] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchTransactions();
    fetchRingkasanKeuangan();
    fetchPengeluaran();
  }, [refreshKeuangan]);

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
      const response = await axios.get(`${API_URL}/products/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRingkasanKeuangan = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/ringkasan/hari-ini`);
      setRingkasan(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPengeluaran = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/pengeluaran/hari-ini`);
      setPengeluaranList(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTambahPengeluaran = async (e) => {
    e.preventDefault();
    if (!formPengeluaran.keterangan || !formPengeluaran.jumlah) {
      toast.error('Isi semua field!');
      return;
    }
    try {
      await axios.post(`${API_URL}/transactions/pengeluaran`, {
        keterangan: formPengeluaran.keterangan,
        jumlah: parseInt(formPengeluaran.jumlah),
        kasir_name: user.nama_lengkap
      });
      toast.success('Pengeluaran dicatat!');
      setFormPengeluaran({ keterangan: '', jumlah: '' });
      setShowPengeluaranModal(false);
      setRefreshKeuangan(!refreshKeuangan);
    } catch (error) {
      toast.error('Gagal mencatat pengeluaran');
    }
  };

  const handleHapusPengeluaran = async (id) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      try {
        await axios.delete(`${API_URL}/transactions/pengeluaran/${id}`);
        toast.success('Pengeluaran dihapus');
        setRefreshKeuangan(!refreshKeuangan);
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.harga }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, subtotal: product.harga }]);
    }
    toast.success(`Ditambahkan: ${product.nama_produk}`);
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.harga }
        : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Item dihapus');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const changeAmount = paymentAmount && paymentMethod === 'cash'
    ? parseInt(paymentAmount) - totalAmount
    : 0;

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    if (paymentMethod === 'cash') {
      if (!paymentAmount || parseInt(paymentAmount) < totalAmount) {
        toast.error('Jumlah pembayaran kurang!');
        return;
      }
    }

    try {
      const response = await axios.post(`${API_URL}/transactions`, {
        items: cart,
        totalAmount,
        paymentAmount: paymentMethod === 'cash' ? parseInt(paymentAmount) : totalAmount,
        changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
        paymentMethod,
        cashierName: user.nama_lengkap
      });

      if (response.data.success) {
        setTransactionData({
          invoiceNumber: response.data.invoiceNumber,
          date: new Date().toLocaleString('id-ID'),
          items: [...cart],
          totalAmount,
          paymentMethod,
          paymentAmount: paymentMethod === 'cash' ? parseInt(paymentAmount) : totalAmount,
          changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
          cashierName: user.nama_lengkap
        });
        setShowReceipt(true);
        fetchTransactions();
        setRefreshKeuangan(!refreshKeuangan);
        toast.success('Transaksi berhasil!');
      }
    } catch (error) {
      toast.error('Gagal memproses transaksi');
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota LDR_Smoothie</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 320px; margin: 0 auto; }
            .text-center { text-align: center; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-t { border-top: 1px dashed #000; }
            .pb-3 { padding-bottom: 12px; }
            .pt-2 { padding-top: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .font-bold { font-weight: bold; }
            .font-mono { font-family: monospace; }
            .text-xs { font-size: 11px; }
            .text-sm { font-size: 12px; }
            .text-xl { font-size: 18px; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="footer">Terima Kasih!<br/>LDR_Smoothie - Fresh & Healthy</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 1000); }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleNewTransaction = () => {
    setShowReceipt(false);
    setCart([]);
    setPaymentAmount('');
    setTransactionData(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.kategori === selectedCategory;
    const matchesSearch = product.nama_produk.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (showReceipt && transactionData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        <div id="receipt-content">
          <div className="text-center border-b border-dashed pb-3 mb-3">
            <div className="font-bold text-xl">LDR_Smoothie</div>
            <div className="text-sm">Fresh & Healthy Smoothies</div>
            <div className="text-xs text-gray-500 mt-1">{transactionData.date}</div>
            <div className="text-xs font-mono">{transactionData.invoiceNumber}</div>
            <div className="text-xs">Kasir: {transactionData.cashierName}</div>
          </div>
          
          <div className="mb-3">
            {transactionData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm py-0.5">
                <div className="flex-1">{item.nama_produk} {item.kode_ukuran}</div>
                <div className="mx-4">{item.quantity}x</div>
                <div className="text-right font-mono min-w-[70px]">{formatPrice(item.subtotal)}</div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-dashed pt-2 mt-2">
            <div className="flex justify-between text-sm py-0.5">
              <span>Total</span>
              <span className="font-mono">{formatPrice(transactionData.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm py-0.5">
              <span>Metode</span>
              <span className="font-mono">{transactionData.paymentMethod === 'cash' ? 'Tunai' : 'QRIS'}</span>
            </div>
            <div className="flex justify-between text-sm py-0.5">
              <span>Dibayar</span>
              <span className="font-mono">{formatPrice(transactionData.paymentAmount)}</span>
            </div>
            {transactionData.paymentMethod === 'cash' && (
              <div className="flex justify-between text-sm py-0.5">
                <span>Kembali</span>
                <span className="font-mono text-green-600">{formatPrice(transactionData.changeAmount)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          <button onClick={handlePrint} className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold">🖨️ Cetak Nota</button>
          <button onClick={handleNewTransaction} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold">+ Transaksi Baru</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🧾 Dashboard Kasir</h2>
          <p className="text-gray-500">Selamat datang, {user.nama_lengkap}</p>
        </div>
        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg">🚪 Logout</button>
      </div>

      {/* Tab Navigasi - 3 Tab */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('cashier')} 
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'cashier' ? 'bg-purple-600 text-white' : 'bg-white'}`}
        >
          🛒 Kasir
        </button>
        <button 
          onClick={() => setActiveTab('keuangan')} 
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'keuangan' ? 'bg-purple-600 text-white' : 'bg-white'}`}
        >
          💰 Keuangan
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'history' ? 'bg-purple-600 text-white' : 'bg-white'}`}
        >
          📊 Riwayat Transaksi
        </button>
      </div>

      {/* TAB 1: KASIR */}
      {activeTab === 'cashier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
              <input type="text" placeholder="🔍 Cari produk..." className="w-full px-4 py-2 border rounded-lg mb-4" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="flex gap-2 overflow-x-auto">
                <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-lg ${selectedCategory === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>Semua</button>
                {categories.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg ${selectedCategory === cat ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>{cat}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{product.kategori}</span>
                    {product.kode_ukuran && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{product.kode_ukuran}</span>}
                  </div>
                  <h3 className="font-bold mt-2 text-gray-800">{product.nama_produk}</h3>
                  <p className="text-purple-600 font-bold text-lg mt-1">{formatPrice(product.harga)}</p>
                  <button onClick={() => addToCart(product)} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg mt-2 hover:from-purple-700 transition-all">+ Tambah</button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
              <h2 className="font-bold text-xl mb-4">🛒 Keranjang</h2>
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Keranjang kosong</p>
              ) : (
                <>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="border-b pb-2">
                        <div className="flex justify-between">
                          <div><p className="font-semibold">{item.nama_produk}</p><p className="text-xs text-gray-500">{item.kode_ukuran}</p></div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-500">✕</button>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 bg-gray-100 rounded-full">-</button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 bg-gray-100 rounded-full">+</button>
                          </div>
                          <p className="font-bold">{formatPrice(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-purple-600">{formatPrice(totalAmount)}</span></div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setPaymentMethod('cash')} className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 'cash' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>💰 Tunai</button>
                      <button onClick={() => setPaymentMethod('qris')} className={`flex-1 py-2 rounded-lg font-semibold ${paymentMethod === 'qris' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>📱 QRIS</button>
                    </div>
                    {paymentMethod === 'cash' && (
                      <input type="number" placeholder="Jumlah bayar" className="w-full px-3 py-2 border rounded-lg mt-3" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
                    )}
                    {paymentMethod === 'qris' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center mt-3">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm text-green-700 font-semibold">Scan QR Code untuk membayar</p>
                        <p className="text-xs text-gray-500 mt-1">Total: {formatPrice(totalAmount)}</p>
                      </div>
                    )}
                    {paymentMethod === 'cash' && paymentAmount && (
                      <div className={`flex justify-between mt-2 font-semibold ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>Kembalian:</span><span>{formatPrice(changeAmount)}</span>
                      </div>
                    )}
                    <button onClick={handlePayment} className="w-full bg-green-500 text-white py-3 rounded-lg font-bold mt-3">💳 Bayar</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEUANGAN */}
      {activeTab === 'keuangan' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-gray-800">💰 Ringkasan Keuangan Hari Ini</h3>
            <button
              onClick={() => setShowPengeluaranModal(true)}
              className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600"
            >
              + Catat Pengeluaran
            </button>
          </div>

          {/* Statistik Keuangan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">💵 Tunai</p>
              <p className="font-bold text-green-600 text-xl">{formatPrice(ringkasan.penjualan.cash)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">📱 QRIS</p>
              <p className="font-bold text-blue-600 text-xl">{formatPrice(ringkasan.penjualan.qris)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">📊 Total Pemasukan</p>
              <p className="font-bold text-purple-600 text-xl">{formatPrice(ringkasan.penjualan.total)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500">💸 Total Pengeluaran</p>
              <p className="font-bold text-red-600 text-xl">{formatPrice(ringkasan.pengeluaran.total)}</p>
            </div>
          </div>

          {/* Saldo Akhir */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 text-center mb-6">
            <p className="text-sm text-gray-600">💰 Saldo Akhir (Pemasukan - Pengeluaran)</p>
            <p className={`font-bold text-2xl ${ringkasan.saldo_akhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPrice(ringkasan.saldo_akhir)}
            </p>
          </div>

          {/* Daftar Pengeluaran */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">📝 Daftar Pengeluaran Hari Ini</h4>
            {pengeluaranList.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada pengeluaran hari ini</p>
            ) : (
              <div className="space-y-2">
                {pengeluaranList.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-gray-800">{item.keterangan}</p>
                      <p className="text-xs text-gray-400">Dicatat oleh: {item.kasir_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-semibold">{formatPrice(item.jumlah)}</span>
                      <button
                        onClick={() => handleHapusPengeluaran(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        title="Hapus"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT TRANSAKSI */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-xl mb-4">📋 Riwayat Transaksi</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada transaksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Invoice</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Bayar</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Kembali</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Metode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-purple-600">{transaction.invoice_number}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(transaction.created_at)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatPrice(transaction.total_amount)}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatPrice(transaction.payment_amount)}</td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">{formatPrice(transaction.change_amount)}</td>
                      <td className="px-4 py-3 text-sm text-center">{transaction.payment_method === 'cash' ? '💰 Tunai' : '📱 QRIS'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Input Pengeluaran */}
      {showPengeluaranModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">📝 Catat Pengeluaran</h3>
            <form onSubmit={handleTambahPengeluaran}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Contoh: Beli es batu, beli gula, dll"
                  value={formPengeluaran.keterangan}
                  onChange={(e) => setFormPengeluaran({...formPengeluaran, keterangan: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Masukkan nominal pengeluaran"
                  value={formPengeluaran.jumlah}
                  onChange={(e) => setFormPengeluaran({...formPengeluaran, jumlah: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700">Simpan</button>
                <button type="button" onClick={() => setShowPengeluaranModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashierDashboard;