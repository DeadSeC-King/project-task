import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        email,
        password
      });
      
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="admin-login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FACC15] rounded-sm mb-4">
            <Shield size={32} className="text-black" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#EDEDED] mb-2">
            ADMIN LOGIN
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Brand IT Admin Panel
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@brandit.com"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                  data-testid="admin-email-input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                  data-testid="admin-password-input"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FACC15] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#e6b800] transition-colors disabled:opacity-50"
              data-testid="admin-login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-sm text-[#A1A1AA]">
          Demo: admin@brandit.com / admin123
        </div>
      </motion.div>
    </div>
  );
}