import { motion } from 'framer-motion';
import { TrendingUp, User, ShoppingCart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ user, cartCount = 0 }) => {
  const navigate = useNavigate();
  const adminToken = localStorage.getItem('admin_token');
  
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-black/40 border-b border-[#2A2A2A]"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
            data-testid="logo-button"
          >
            <div className="bg-[#00FF94] p-2 rounded-sm group-hover:shadow-[0_0_20px_rgba(0,255,148,0.5)] transition-shadow">
              <TrendingUp className="text-black" size={24} />
            </div>
            <span className="font-heading font-black text-xl tracking-tighter uppercase hidden md:block">BRAND IT</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/marketplace')}
              className="text-sm text-[#A1A1AA] hover:text-[#00FF94] transition-colors font-medium"
              data-testid="marketplace-link"
            >
              Marketplace
            </button>
            
            {adminToken && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-sm text-[#FACC15] hover:text-[#00FF94] transition-colors"
                data-testid="admin-dashboard-link"
              >
                <Shield size={18} />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}
            
            {user ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#00FF94] transition-colors"
                  data-testid="dashboard-link"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </button>
                
                <button
                  onClick={() => navigate('/cart')}
                  className="relative flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-[#00FF94] transition-colors"
                  data-testid="cart-button"
                >
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#FF3B30] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="cart-count">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-[#00FF94] text-black px-4 py-2 rounded-sm font-bold text-sm hover:bg-[#00CC76] transition-colors"
                data-testid="login-button"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};