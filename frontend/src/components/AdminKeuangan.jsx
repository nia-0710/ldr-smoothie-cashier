import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

function AdminKeuangan() {
  const [ringkasanHarian, setRingkasanHarian] = useState({
    penjualan: { cash: 0, qris: 0, total: 0 },
    pengeluaran: { total: 0 },
    saldo_akhir: 0
  });
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [periodeFilter, setPeriodeFilter] = useState('hari');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [ringkasanPeriode, setRingkasanPeriode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRingkasanHarian();
    fetchPengeluaran();
  }, []);

  const fetchRingkasanHarian = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/keuangan/hari-ini`);
      setRingkasanHarian(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPengeluaran = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/pengeluaran`);
      setPengeluaranList(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRingkasanPeriode = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/keuangan/periode`, {
        params: { start_date: startDate, end_date: endDate }
      });
      setRingkasanPeriode(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPeriode = (e) => {
    e.preventDefault();
    fetchRingkasanPeriode();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Ringkasan Hari Ini */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-4">💰 Ringkasan Keuangan Hari Ini</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">💵 Tunai</p>
            <p className="font-bold text-green-600 text-xl">{formatPrice(ringkasanHarian.penjualan.cash)}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">📱 QRIS</p>
            <p className="font-bold text-blue-600 text-xl">{formatPrice(ringkasanHarian.penjualan.qris)}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">📊 Total Pemasukan</p>
            <p className="font-bold text-purple-600 text-xl">{formatPrice(ringkasanHarian.penjualan.total)}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">💸 Total Pengeluaran</p>
            <p className="font-bold text-red-600 text-xl">{formatPrice(ringkasanHarian.pengeluaran.total)}</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600">💰 Saldo Akhir Hari Ini</p>
          <p className={`font-bold text-2xl ${ringkasanHarian.saldo_akhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPrice(ringkasanHarian.saldo_akhir)}
          </p>
        </div>
      </div>

      {/* Filter Periode */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-4">📅 Laporan Keuangan Periode</h3>
        <form onSubmit={handleFilterPeriode} className="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700"
          >
            Tampilkan
          </button>
        </form>

        {loading ? (
          <p className="text-center py-8 text-gray-500">Memuat data...</p>
        ) : ringkasanPeriode ? (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">💵 Tunai</p>
                <p className="font-bold text-green-600">{formatPrice(ringkasanPeriode.penjualan?.cash)}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">📱 QRIS</p>
                <p className="font-bold text-blue-600">{formatPrice(ringkasanPeriode.penjualan?.qris)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">📊 Total Pemasukan</p>
                <p className="font-bold text-purple-600">{formatPrice(ringkasanPeriode.penjualan?.total)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">💸 Total Pengeluaran</p>
                <p className="font-bold text-red-600">{formatPrice(ringkasanPeriode.pengeluaran?.total)}</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">💰 Saldo Periode</p>
              <p className={`font-bold text-xl ${ringkasanPeriode.saldo_akhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPrice(ringkasanPeriode.saldo_akhir)}
              </p>
            </div>
            <div className="mt-3 text-center text-sm text-gray-500">
              <p>📊 Total Transaksi: {ringkasanPeriode.penjualan?.transaksi || 0} | 📝 Total Pengeluaran: {ringkasanPeriode.pengeluaran?.item || 0} item</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">Pilih periode dan klik Tampilkan</p>
        )}
      </div>

      {/* Daftar Pengeluaran */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-xl text-gray-800 mb-4">📝 Riwayat Pengeluaran</h3>
        {pengeluaranList.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada data pengeluaran</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Keterangan</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Jumlah</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pengeluaranList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(item.tanggal)}</td>
                    <td className="px-4 py-3 text-sm">{item.keterangan}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-red-600">{formatPrice(item.jumlah)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.kasir_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminKeuangan;