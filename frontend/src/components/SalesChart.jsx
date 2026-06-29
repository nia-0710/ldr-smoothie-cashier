import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function SalesChart() {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [chartType]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      let response;
      switch (chartType) {
        case 'daily':
          response = await axios.get(`${API_URL}/admin/chart/daily`);
          break;
        case 'weekly':
          response = await axios.get(`${API_URL}/admin/chart/weekly`);
          break;
        case 'monthly':
          response = await axios.get(`${API_URL}/admin/chart/monthly`);
          break;
        case 'yearly':
          response = await axios.get(`${API_URL}/admin/chart/yearly`);
          break;
        default:
          response = await axios.get(`${API_URL}/admin/chart/daily`);
      }
      setChartData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format harga dengan proteksi angka terlalu besar
  const formatPrice = (price) => {
    if (!price || isNaN(price) || price === 0) return 'Rp 0';
    // Jika angka terlalu besar (lebih dari 1 Miliar), konversi ke Juta
    if (price > 1000000000) {
      return 'Rp ' + (price / 1000000).toFixed(0) + ' Jt';
    }
    if (price > 100000000) {
      return 'Rp ' + (price / 1000).toFixed(0) + ' Rb';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'daily': return '📊 Grafik Penjualan Harian (7 Hari Terakhir)';
      case 'weekly': return '📊 Grafik Penjualan Mingguan (4 Minggu Terakhir)';
      case 'monthly': return '📊 Grafik Penjualan Bulanan (12 Bulan Terakhir)';
      case 'yearly': return '📊 Grafik Penjualan Tahunan (5 Tahun Terakhir)';
      default: return '📊 Grafik Penjualan';
    }
  };

  // Hitung nilai maksimum untuk skala grafik (filter angka wajar)
  const getMaxValue = () => {
    if (chartData.length === 0) return 100;
    // Filter angka yang wajar (maksimal 50 juta untuk skala grafik)
    const validValues = chartData
      .map(item => item.total_penjualan || 0)
      .filter(val => val < 50000000 && val > 0);
    
    if (validValues.length === 0) return 100;
    const max = Math.max(...validValues);
    return max + (max * 0.1);
  };

  const maxValue = getMaxValue();

  // Format label untuk sumbu X
  const getXLabel = (item) => {
    if (chartType === 'daily') {
      // Tampilkan tanggal saja (contoh: 21/05)
      return item.tanggal?.slice(5) || '-';
    }
    if (chartType === 'weekly') {
      return item.minggu || '-';
    }
    if (chartType === 'monthly') {
      return item.nama_bulan?.slice(0, 3) || '-';
    }
    if (chartType === 'yearly') {
      return item.tahun || '-';
    }
    return '-';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h3 className="font-bold text-xl text-gray-800">{getChartTitle()}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('daily')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${chartType === 'daily' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📅 Harian
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${chartType === 'weekly' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📆 Mingguan
          </button>
          <button
            onClick={() => setChartType('monthly')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${chartType === 'monthly' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            📅 Bulanan
          </button>
          <button
            onClick={() => setChartType('yearly')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${chartType === 'yearly' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            🗓️ Tahunan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500">Memuat data grafik...</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500">Belum ada data penjualan</p>
        </div>
      ) : (
        <>
          {/* Grafik Bar */}
          <div className="relative pt-6 pb-2">
            <div className="flex justify-between items-end h-80 gap-2">
              {chartData.map((item, index) => {
                // Hitung tinggi bar (maksimal 95% dari container)
                let height = 0;
                if (item.total_penjualan && item.total_penjualan < 50000000) {
                  height = (item.total_penjualan / maxValue) * 95;
                }
                height = Math.min(height, 95); // Maksimal 95%
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group">
                    <div className="w-full bg-purple-100 rounded-t-lg relative" style={{ height: '240px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                      <div 
                        className="bg-gradient-to-t from-purple-600 to-indigo-600 rounded-t-lg transition-all duration-500 w-full"
                        style={{ height: `${height}%`, minHeight: '4px' }}
                      >
                        {/* Tooltip hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                          {formatPrice(item.total_penjualan)}
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-3 w-full">
                      <p className="text-xs font-medium text-gray-700">
                        {getXLabel(item)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.total_transaksi} trx</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ringkasan Statistik */}
          <div className="mt-8 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-gray-500 text-xs">Total Penjualan</p>
              <p className="font-bold text-purple-600 text-lg">
                {formatPrice(chartData.reduce((sum, item) => sum + (item.total_penjualan || 0), 0))}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-gray-500 text-xs">Total Transaksi</p>
              <p className="font-bold text-blue-600 text-lg">
                {chartData.reduce((sum, item) => sum + (item.total_transaksi || 0), 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-gray-500 text-xs">Rata-rata per {chartType === 'daily' ? 'Hari' : chartType === 'weekly' ? 'Minggu' : chartType === 'monthly' ? 'Bulan' : 'Tahun'}</p>
              <p className="font-bold text-green-600 text-lg">
                {formatPrice((chartData.reduce((sum, item) => sum + (item.total_penjualan || 0), 0) / chartData.length) || 0)}
              </p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-gray-500 text-xs">Periode Data</p>
              <p className="font-bold text-orange-600 text-lg">
                {chartData.length} {chartType === 'daily' ? 'Hari' : chartType === 'weekly' ? 'Minggu' : chartType === 'monthly' ? 'Bulan' : 'Tahun'}
              </p>
            </div>
          </div>

          {/* Informasi tambahan */}
          <div className="mt-4 text-center text-xs text-gray-400">
            <p>💡 Arahkan kursor ke batang grafik untuk melihat detail nominal</p>
          </div>
        </>
      )}
    </div>
  );
}

export default SalesChart;