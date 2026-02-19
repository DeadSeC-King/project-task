import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'sonner';
import { Navbar } from './components/custom/Navbar';
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(savedUser);
    
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    const interval = setInterval(updateCartCount, 1000);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar user={user} cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
        <Toaster 
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: '#121212',
              color: '#EDEDED',
              border: '1px solid #2A2A2A'
            }
          }}
        />
      </BrowserRouter>
    </div>
  );
}

export default App;