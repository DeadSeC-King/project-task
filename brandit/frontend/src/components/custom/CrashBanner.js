import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export const CrashBanner = ({ products }) => {
  const [isVisible, setIsVisible] = useState(true);
  const crashProducts = products.filter(p => p.crash_sale_active);
  
  useEffect(() => {
    const bannerClosed = localStorage.getItem('crashBannerClosed');
    if (bannerClosed === 'true') {
      setIsVisible(false);
    }
  }, []);
  
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('crashBannerClosed', 'true');
    setTimeout(() => {
      localStorage.removeItem('crashBannerClosed');
    }, 3600000); // Reset after 1 hour
  };
  
  if (crashProducts.length === 0 || !isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        exit={{ y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FF3B30] text-white py-3 overflow-hidden"
        data-testid="crash-banner"
      >
        <div className="flex items-center justify-center gap-3 animate-pulse">
          <AlertTriangle size={20} />
          <div className="font-heading font-bold text-sm md:text-base uppercase tracking-wider">
            CRASH SALE ACTIVE: {crashProducts.length} Products at 50% OFF!
          </div>
          <AlertTriangle size={20} />
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-white/20 p-1 rounded transition-colors"
            data-testid="close-crash-banner"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};