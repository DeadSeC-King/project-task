import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TickerCard = ({ product }) => {
  const navigate = useNavigate();
  
  const getPriceChange = () => {
    if (!product.price_history || product.price_history.length < 2) {
      return 0;
    }
    const latest = product.current_price;
    const previous = product.price_history[product.price_history.length - 2]?.price || product.base_price;
    return ((latest - previous) / previous) * 100;
  };
  
  const priceChange = getPriceChange();
  const isPositive = priceChange >= 0;
  
  return (
    <motion.div
      data-testid="ticker-card"
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className={`relative cursor-pointer bg-[#121212] border-l-4 ${
        product.crash_sale_active ? 'border-l-[#FF3B30]' : isPositive ? 'border-l-[#00FF94]' : 'border-l-[#FF3B30]'
      } p-4 rounded-sm border border-[#2A2A2A] hover:border-[#00FF94]/50 transition-colors`}
    >
      {product.crash_sale_active && (
        <div className="absolute -top-2 -right-2 bg-[#FF3B30] text-white text-xs font-bold px-3 py-1 rounded-sm animate-pulse flex items-center gap-1" data-testid="crash-sale-badge">
          <Zap size={12} />
          CRASH SALE
        </div>
      )}
      
      <div className="aspect-video mb-3 overflow-hidden rounded-sm">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-bold text-lg text-[#EDEDED]" data-testid="product-name">{product.name}</h3>
          {isPositive ? (
            <TrendingUp className="text-[#00FF94] flex-shrink-0" size={20} data-testid="trend-up" />
          ) : (
            <TrendingDown className="text-[#FF3B30] flex-shrink-0" size={20} data-testid="trend-down" />
          )}
        </div>
        
        <div className="text-xs text-[#A1A1AA] uppercase tracking-wider">{product.category}</div>
        
        <div className="flex items-end justify-between">
          <div>
            <div className="font-mono text-3xl font-bold text-[#EDEDED]" data-testid="current-price">
              ₹{product.current_price.toFixed(2)}
            </div>
            <div className={`font-mono text-sm font-bold ${
              isPositive ? 'text-[#00FF94]' : 'text-[#FF3B30]'
            }`} data-testid="price-change">
              {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
            </div>
          </div>
          
          <div className="text-right text-xs text-[#A1A1AA]">
            <div>Vol: {product.purchase_count}</div>
            <div className="font-mono">Max: ₹{product.max_retail_price}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};