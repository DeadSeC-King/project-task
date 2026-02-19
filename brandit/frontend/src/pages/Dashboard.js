import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(savedUser);
    fetchOrders(savedUser.id);
  }, [navigate]);
  
  const fetchOrders = async (userId) => {
    try {
      const response = await axios.get(`${API}/orders/user/${userId}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  return (
    <div className="min-h-screen py-12" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-2">
              DASHBOARD
            </h1>
            <p className="text-lg text-[#A1A1AA]">
              Welcome back, {user?.phone_number}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-6 py-3 rounded-sm font-bold hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors"
            data-testid="logout-button"
          >
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <Package className="text-[#00FF94] mb-2" size={32} />
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Total Orders</div>
            <div className="font-mono text-4xl font-bold text-[#EDEDED]" data-testid="total-orders">{orders.length}</div>
          </div>
          
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <CheckCircle className="text-[#00FF94] mb-2" size={32} />
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Completed</div>
            <div className="font-mono text-4xl font-bold text-[#EDEDED]">
              {orders.filter(o => o.payment_status === 'completed').length}
            </div>
          </div>
          
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <Clock className="text-[#FACC15] mb-2" size={32} />
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Pending</div>
            <div className="font-mono text-4xl font-bold text-[#EDEDED]">
              {orders.filter(o => o.payment_status === 'pending').length}
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">Order History</h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm animate-pulse">
                  <div className="h-4 bg-[#1E1E1E] mb-2 w-1/3 rounded"></div>
                  <div className="h-3 bg-[#1E1E1E] w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm"
                  data-testid="order-item"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <div className="font-mono text-sm text-[#A1A1AA] mb-1">Order ID: {order.id.slice(0, 8)}...</div>
                      <div className="text-xs text-[#A1A1AA]">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-sm text-xs font-bold uppercase ${
                        order.payment_status === 'completed'
                          ? 'bg-[#00FF94]/20 text-[#00FF94]'
                          : 'bg-[#FACC15]/20 text-[#FACC15]'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {order.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-[#EDEDED]">{product.name} x{product.quantity}</span>
                        <span className="font-mono text-[#A1A1AA]">₹{(product.price * product.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-[#2A2A2A]">
                    <span className="text-[#A1A1AA] uppercase text-sm tracking-wider">Total</span>
                    <span className="font-mono text-2xl font-bold text-[#00FF94]">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#121212] border border-[#2A2A2A] rounded-sm" data-testid="no-orders-message">
              <Package className="mx-auto text-[#A1A1AA] mb-4" size={64} />
              <p className="text-[#A1A1AA] mb-4">No orders yet</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-[#00FF94] text-black px-6 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#00CC76] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}