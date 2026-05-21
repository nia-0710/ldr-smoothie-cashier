import React from 'react';

function ProductCard({ product, onAdd }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryColor = (kategori) => {
    const colors = {
      'Jus': 'bg-green-100 text-green-700',
      'Smoothie': 'bg-pink-100 text-pink-700',
      'Es Teler': 'bg-blue-100 text-blue-700',
      'Cokelat': 'bg-yellow-100 text-yellow-700',
      'Salad': 'bg-emerald-100 text-emerald-700',
      'Es': 'bg-cyan-100 text-cyan-700'
    };
    return colors[kategori] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(product.kategori)}`}>
            {product.kategori}
          </span>
          {product.kode_ukuran && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {product.kode_ukuran}
            </span>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{product.nama_produk}</h3>
        <p className="text-purple-600 font-bold text-xl mb-3">{formatPrice(product.harga)}</p>
        <button
          onClick={() => onAdd(product)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
        >
          + Tambah
        </button>
      </div>
    </div>
  );
}

export default ProductCard;