import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import CashierDashboard from './components/CashierDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    console.log('Login sebagai:', userData);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Jika belum login, tampilkan halaman login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  console.log('User role:', user.role);
  console.log('Tampilkan dashboard untuk:', user.role === 'admin' ? 'Admin' : 'Kasir');

  // Jika sudah login, tampilkan dashboard sesuai role
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
      <Toaster position="top-right" />
      
      <div className="container mx-auto px-4 py-8">
        {user.role === 'admin' ? (
          <AdminDashboard user={user} onLogout={handleLogout} />
        ) : (
          <CashierDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default App;