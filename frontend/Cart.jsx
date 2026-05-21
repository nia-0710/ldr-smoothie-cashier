import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

function Cart({ cart, totalAmount, onUpdateQuantity, onRemove }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const changeAmount = paymentAmount && totalAmount
    ? parseInt(paymentAmount) - totalAmount
    : 0;

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    if (!paymentAmount || parseInt(paymentAmount) < totalAmount) {
      toast.error('Jumlah pembayaran kurang!');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(`${API_URL}/transactions`, {
        items: cart,
        totalAmount,
        paymentAmount: parseInt(paymentAmount),
        changeAmount
      });

      if (response.data.success) {
        toast.success(`Transaksi berhasil! Invoice: ${response.data.invoiceNumber}`);
        // Reset cart and payment
        setPaymentAmount('');
        window.location.reload();
      }
    } catch (error) {
      toast.error('Gagal memproses transaksi');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        🛒 Keranjang Belanja
        {cart.length > 0 && (
          <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {cart.length} item
          </span>
        )}
      </h2>

      {cart.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-6xl mb-2">🛍️</div>
          <p>Keranjang masih kosong</p>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto mb-4 space-y-2">
            {cart.map(item => (
              <div key={item.id} className="border-b pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.nama_produk}</p>
                    <p className="text-xs text-gray-500">{item.kode_ukuran || ''}</p>
                    <p className="text-purple-600 font-bold">{formatPrice(item.harga)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-gray-800">{formatPrice(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-purple-600">{formatPrice(totalAmount)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jumlah Bayar:
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Masukkan jumlah bayar"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>

            {paymentAmount && totalAmount && (
              <div className={`flex justify-between ${changeAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Kembalian:</span>
                <span className="font-bold">{formatPrice(changeAmount)}</span>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={isProcessing || cart.length === 0}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Memproses...' : '💳 Bayar Sekarang'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
function Cart({ cart, totalAmount, onUpdateQuantity, onRemove, cashierName = 'Kasir' }) {
  // ... kode lainnya sama ...

  const handlePayment = async () => {
    // ... 
    const response = await axios.post(`${API_URL}/transactions`, {
      items: cart,
      totalAmount,
      paymentAmount: paymentMethod === 'cash' ? parseInt(paymentAmount) : totalAmount,
      changeAmount: paymentMethod === 'cash' ? changeAmount : 0,
      paymentMethod,
      cashierName  // <- tambahkan ini
    });
    // ...
  };
}
export default Cart;