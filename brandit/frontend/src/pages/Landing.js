import { useState, useEffect } from 'react';
import { MarketOverview } from '../components/custom/MarketOverview';
import { TickerCard } from '../components/custom/TickerCard';
import { CrashBanner } from '../components/custom/CrashBanner';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const crashProducts = products.filter(p => p.crash_sale_active);
  const topGainers = products
    .filter(p => !p.crash_sale_active)
    .sort((a, b) => (b.current_price - b.base_price) - (a.current_price - a.base_price))
    .slice(0, 4);
  
  return (
    <div className="min-h-screen" data-testid="landing-page">
      <CrashBanner products={products} />
      
      <MarketOverview />
      
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16">
        {crashProducts.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="text-[#FF3B30]" size={32} />
              <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[#EDEDED]" data-testid="crash-watch-title">
                CRASH WATCH
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {crashProducts.map((product) => (
                <TickerCard key={product.id} product={product} />
              ))}
            </div>
          </motion.section>
        )}
        
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-[#00FF94]" size={32} />
            <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight text-[#EDEDED]" data-testid="top-gainers-title">
              TOP GAINERS
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm animate-pulse">
                  <div className="aspect-video bg-[#1E1E1E] mb-3 rounded-sm"></div>
                  <div className="h-4 bg-[#1E1E1E] mb-2 rounded"></div>
                  <div className="h-8 bg-[#1E1E1E] rounded"></div>
                </div>
              ))}
            </div>
          ) : topGainers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topGainers.map((product) => (
                <TickerCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#A1A1AA]">
              <p>No products available. Add some products to get started!</p>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}