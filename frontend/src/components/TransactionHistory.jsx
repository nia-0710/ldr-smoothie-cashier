import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
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
      dateStyle: 'full',
      timeStyle: 'medium'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Riwayat Transaksi</h2>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-6xl mb-2">📭</div>
          <p>Belum ada transaksi</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Invoice</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Bayar</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Kembali</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-4 py-3 text-sm font-mono text-purple-600">
                    {transaction.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    {formatPrice(transaction.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatPrice(transaction.payment_amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-green-600">
                    {formatPrice(transaction.change_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;