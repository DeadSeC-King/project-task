import { useState, useEffect } from 'react';
import { TickerCard } from '../components/custom/TickerCard';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Marketplace() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
        setFilteredProducts(response.data);
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
  
  useEffect(() => {
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);
  
  const categories = ['all', ...new Set(products.map(p => p.category))];
  
  return (
    <div className="min-h-screen py-12" data-testid="marketplace-page">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-4" data-testid="marketplace-title">
            MARKETPLACE
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Live market feed. Prices update in real-time based on demand.
          </p>
        </motion.div>
        
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121212] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors"
              data-testid="search-input"
            />
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <SlidersHorizontal className="text-[#A1A1AA]" size={20} />
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#00FF94] text-black'
                    : 'bg-[#121212] text-[#A1A1AA] border border-[#2A2A2A] hover:border-[#00FF94]'
                }`}
                data-testid={`category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm animate-pulse">
                <div className="aspect-video bg-[#1E1E1E] mb-3 rounded-sm"></div>
                <div className="h-4 bg-[#1E1E1E] mb-2 rounded"></div>
                <div className="h-8 bg-[#1E1E1E] rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TickerCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-[#A1A1AA]" data-testid="no-products-message">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}