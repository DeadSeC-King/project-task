import { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const designImages = [
  "https://images.unsplash.com/photo-1766601269422-a6673de6daf3?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1758524572193-3ebae7d5ff1a?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1675627451054-99b6c760b6d2?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1720983025381-7174d55327de?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1607555557810-f99617a505d7?crop=entropy&cs=srgb&fm=jpg&q=85",
  "https://images.unsplash.com/photo-1762279388988-3f8abcc7dca2?crop=entropy&cs=srgb&fm=jpg&q=85"
];

export default function Admin() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: designImages[0],
    base_price: '',
    max_retail_price: '',
    price_increment_percent: '5'
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.base_price || !formData.max_retail_price) {
      toast.error('Please fill all required fields');
      return;
    }
    
    if (parseFloat(formData.max_retail_price) <= parseFloat(formData.base_price)) {
      toast.error('Max retail price must be greater than base price');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post(`${API}/products`, {
        ...formData,
        base_price: parseFloat(formData.base_price),
        max_retail_price: parseFloat(formData.max_retail_price),
        price_increment_percent: parseFloat(formData.price_increment_percent)
      });
      
      toast.success('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        category: '',
        image_url: designImages[0],
        base_price: '',
        max_retail_price: '',
        price_increment_percent: '5'
      });
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen py-12" data-testid="admin-page">
      <div className="max-w-4xl mx-auto px-4 md:px-12">
        <div className="mb-8">
          <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-4">
            ADMIN PANEL
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            Add new products to the marketplace
          </p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-[#00FF94]" size={32} />
            <h2 className="font-heading text-3xl font-bold text-[#EDEDED]">Add New Product</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Digital Product Name"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors"
                  data-testid="product-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  placeholder="Software, Design, etc."
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors"
                  data-testid="category-input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Product description..."
                rows={4}
                className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors resize-none"
                data-testid="description-input"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Product Image</label>
              <div className="grid grid-cols-3 gap-3">
                {designImages.map((url, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({...formData, image_url: url})}
                    className={`aspect-video overflow-hidden rounded-sm border-2 transition-all ${
                      formData.image_url === url
                        ? 'border-[#00FF94] shadow-[0_0_20px_rgba(0,255,148,0.3)]'
                        : 'border-[#2A2A2A] hover:border-[#00FF94]/50'
                    }`}
                  >
                    <img src={url} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Base Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({...formData, base_price: e.target.value})}
                  placeholder="999.00"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors font-mono"
                  data-testid="base-price-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Max Price (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.max_retail_price}
                  onChange={(e) => setFormData({...formData, max_retail_price: e.target.value})}
                  placeholder="9999.00"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors font-mono"
                  data-testid="max-price-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Increment (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.price_increment_percent}
                  onChange={(e) => setFormData({...formData, price_increment_percent: e.target.value})}
                  placeholder="5.0"
                  className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors font-mono"
                  data-testid="increment-input"
                />
              </div>
            </div>
            
            <div className="bg-[#1E1E1E] border border-[#2A2A2A] p-4 rounded-sm">
              <div className="text-xs text-[#A1A1AA] mb-2 uppercase tracking-wider">Pricing Preview:</div>
              <ul className="text-sm text-[#EDEDED] space-y-1">
                <li>• Starting price: ₹{formData.base_price || '0.00'}</li>
                <li>• Price increases {formData.price_increment_percent || '0'}% per sale</li>
                <li>• Crash sale triggers at ₹{formData.max_retail_price || '0.00'} (50% off)</li>
                <li>• Minimum floor price: ₹{(parseFloat(formData.base_price || 0) * 0.5).toFixed(2)}</li>
              </ul>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00FF94] text-black py-4 rounded-sm font-heading font-bold text-lg uppercase tracking-wider hover:bg-[#00CC76] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="add-product-button"
            >
              {loading ? 'Adding...' : (
                <>
                  <Plus size={20} />
                  Add Product
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}