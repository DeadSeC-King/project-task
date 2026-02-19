import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Zap, ArrowLeft, ShoppingCart, Zap as Lightning } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API}/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    const interval = setInterval(fetchProduct, 15000);
    return () => clearInterval(interval);
  }, [id]);
  
  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
    window.dispatchEvent(new Event('storage'));
  };
  
  const buyNow = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    
    localStorage.setItem('cart', JSON.stringify([{ ...product, quantity: 1 }]));
    window.dispatchEvent(new Event('storage'));
    navigate('/checkout');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#A1A1AA]">Loading...</div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#A1A1AA]">Product not found</div>
      </div>
    );
  }
  
  const chartData = product.price_history.slice(-24).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    price: item.price
  }));
  
  const priceChange = product.price_history.length >= 2
    ? ((product.current_price - product.price_history[product.price_history.length - 2].price) / product.price_history[product.price_history.length - 2].price) * 100
    : 0;
  
  const isPositive = priceChange >= 0;
  
  return (
    <div className="min-h-screen py-12" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#00FF94] mb-8 transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="aspect-square overflow-hidden rounded-sm mb-6">
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-4">Price History (24h)</div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? "#00FF94" : "#FF3B30"} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? "#00FF94" : "#FF3B30"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#A1A1AA" 
                      style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis 
                      stroke="#A1A1AA" 
                      style={{ fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121212', 
                        border: '1px solid #2A2A2A',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? "#00FF94" : "#FF3B30"}
                      strokeWidth={2}
                      fill="url(#productGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-[#A1A1AA]">No price history yet</div>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {product.crash_sale_active && (
              <div className="bg-[#FF3B30] text-white px-4 py-3 rounded-sm mb-6 flex items-center gap-2" data-testid="crash-sale-alert">
                <Zap size={20} />
                <span className="font-bold uppercase tracking-wider">CRASH SALE ACTIVE - 50% OFF</span>
              </div>
            )}
            
            <div className="mb-6">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2">{product.category}</div>
              <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight text-[#EDEDED] mb-6" data-testid="product-detail-name">
                {product.name}
              </h1>
              
              <div className="bg-[#1E1E1E] border border-[#2A2A2A] p-6 rounded-sm mb-6">
                <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-3">Product Description</div>
                <p className="text-base md:text-lg text-[#EDEDED] leading-relaxed">{product.description}</p>
              </div>
            </div>
            
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm mb-6">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-2">Current Price</div>
                  <div className="font-mono text-5xl font-bold text-[#EDEDED]" data-testid="product-detail-price">
                    ₹{product.current_price.toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="text-[#00FF94]" size={24} />
                  ) : (
                    <TrendingDown className="text-[#FF3B30]" size={24} />
                  )}
                  <span className={`font-mono text-2xl font-bold ${
                    isPositive ? 'text-[#00FF94]' : 'text-[#FF3B30]'
                  }`}>
                    {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2A2A2A]">
                <div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Base Price</div>
                  <div className="font-mono text-sm text-[#EDEDED]">₹{product.base_price}</div>
                </div>
                <div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Max Price</div>
                  <div className="font-mono text-sm text-[#EDEDED]">₹{product.max_retail_price}</div>
                </div>
                <div>
                  <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Volume</div>
                  <div className="font-mono text-sm text-[#EDEDED]">{product.purchase_count}</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={addToCart}
                className="bg-[#1E1E1E] border-2 border-[#00FF94] text-[#00FF94] py-4 rounded-sm font-heading font-bold text-lg uppercase tracking-wider hover:bg-[#00FF94] hover:text-black transition-all flex items-center justify-center gap-2"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              
              <button
                onClick={buyNow}
                className="bg-[#00FF94] text-black py-4 rounded-sm font-heading font-bold text-lg uppercase tracking-wider hover:bg-[#00CC76] transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,148,0.3)]"
                data-testid="buy-now-button"
              >
                <Lightning size={20} />
                Buy Now
              </button>
            </div>
            
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] p-4 rounded-sm">
              <div className="text-xs text-[#A1A1AA] mb-2">PRICE DYNAMICS:</div>
              <ul className="text-sm text-[#EDEDED] space-y-1">
                <li>• Price increases {product.price_increment_percent}% per purchase</li>
                <li>• Crash sale triggers at max price (₹{product.max_retail_price})</li>
                <li>• Price decays without purchases</li>
                <li>• Minimum price: ₹{(product.base_price * 0.5).toFixed(2)}</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}