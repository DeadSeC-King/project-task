import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Package, Edit, Trash2, Plus, LogOut, Shield, Key, UserPlus, Zap } from 'lucide-react';
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCrashSalePanel, setShowCrashSalePanel] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: designImages[0],
    base_price: '',
    max_retail_price: '',
    price_increment_percent: '5'
  });
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchAdmins();
  }, [navigate]);
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAdmins = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await axios.get(`${API}/admin/all-admins`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (error) {
      console.error('Failed to fetch admins');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.base_price || !formData.max_retail_price) {
      toast.error('Please fill required fields');
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    
    try {
      if (editingProduct) {
        await axios.put(
          `${API}/admin/products/${editingProduct.id}`,
          {
            ...formData,
            base_price: parseFloat(formData.base_price),
            max_retail_price: parseFloat(formData.max_retail_price),
            price_increment_percent: parseFloat(formData.price_increment_percent)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/products`, {
          ...formData,
          base_price: parseFloat(formData.base_price),
          max_retail_price: parseFloat(formData.max_retail_price),
          price_increment_percent: parseFloat(formData.price_increment_percent)
        });
        toast.success('Product added!');
      }
      
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };
  
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      image_url: product.image_url,
      base_price: product.base_price.toString(),
      max_retail_price: product.max_retail_price.toString(),
      price_increment_percent: product.price_increment_percent.toString()
    });
    setShowForm(true);
  };
  
  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      image_url: designImages[0],
      base_price: '',
      max_retail_price: '',
      price_increment_percent: '5'
    });
    setEditingProduct(null);
    setShowForm(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    navigate('/');
  };
  
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    if (!adminFormData.name || !adminFormData.email || !adminFormData.password) {
      toast.error('Please fill all fields');
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(`${API}/admin/create-admin`, adminFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin created successfully!');
      setAdminFormData({ name: '', email: '', password: '' });
      setShowAdminForm(false);
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!passwordFormData.current_password || !passwordFormData.new_password) {
      toast.error('Please fill all fields');
      return;
    }
    
    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordFormData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(`${API}/admin/change-password`, {
        current_password: passwordFormData.current_password,
        new_password: passwordFormData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully!');
      setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };
  
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`${API}/admin/delete-admin/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Admin deleted successfully!');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete admin');
    }
  };
  
  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };
  
  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };
  
  const handleCrashSale = async (activate) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(`${API}/admin/crash-sale`, {
        product_ids: selectedProducts,
        activate: activate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Crash sale ${activate ? 'activated' : 'deactivated'} for ${selectedProducts.length} product(s)!`);
      setSelectedProducts([]);
      setShowCrashSalePanel(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to manage crash sale');
    }
  };
  
  return (
    <div className="min-h-screen py-12" data-testid="admin-dashboard-page">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-2">
              ADMIN PANEL
            </h1>
            <p className="text-lg text-[#A1A1AA]">Manage Brand IT Products</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-6 py-3 rounded-sm font-bold hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors"
            data-testid="admin-logout-button"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <Package className="text-[#00FF94] mb-2" size={32} />
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Total Products</div>
            <div className="font-mono text-4xl font-bold text-[#EDEDED]" data-testid="admin-total-products">{products.length}</div>
          </div>
          
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <Shield className="text-[#FACC15] mb-2" size={32} />
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Total Admins</div>
            <div className="font-mono text-4xl font-bold text-[#EDEDED]">{admins.length}</div>
          </div>
        </div>
        
        <div className="mb-8 flex gap-4 border-b border-[#2A2A2A]">
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-6 font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'products'
                ? 'text-[#00FF94] border-b-2 border-[#00FF94]'
                : 'text-[#A1A1AA] hover:text-[#EDEDED]'
            }`}
            data-testid="products-tab"
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className={`pb-4 px-6 font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'admins'
                ? 'text-[#FACC15] border-b-2 border-[#FACC15]'
                : 'text-[#A1A1AA] hover:text-[#EDEDED]'
            }`}
            data-testid="admins-tab"
          >
            Manage Admins
          </button>
        </div>
        
        {activeTab === 'products' && (
          <>
            <div className="mb-8 flex flex-wrap gap-4">
              {!showForm ? (
                <>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-[#00FF94] text-black px-6 py-3 rounded-sm font-bold hover:bg-[#00CC76] transition-colors"
                    data-testid="show-add-product-form"
                  >
                    <Plus size={20} />
                    Add New Product
                  </button>
                  
                  <button
                    onClick={() => setShowCrashSalePanel(!showCrashSalePanel)}
                    className="flex items-center gap-2 bg-[#FF3B30] text-white px-6 py-3 rounded-sm font-bold hover:bg-[#CC2F26] transition-colors"
                    data-testid="toggle-crash-sale-panel"
                  >
                    <Zap size={20} />
                    Manage Crash Sales
                  </button>
                </>
              ) : null}
            </div>
            
            {showCrashSalePanel && !showForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E1E1E] border-2 border-[#FF3B30] p-6 rounded-sm mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="text-[#FF3B30]" size={32} />
                    <div>
                      <h2 className="font-heading text-2xl font-bold text-[#EDEDED]">Crash Sale Control</h2>
                      <p className="text-sm text-[#A1A1AA]">Select products and activate/deactivate crash sales (50% off)</p>
                    </div>
                  </div>
                  <div className="text-[#EDEDED] font-mono">
                    <span className="text-[#FF3B30] font-bold text-2xl">{selectedProducts.length}</span> selected
                  </div>
                </div>
                
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={selectAllProducts}
                    className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-2 rounded-sm text-sm font-bold hover:border-[#00FF94] transition-colors"
                    data-testid="select-all-products"
                  >
                    {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  <button
                    onClick={() => handleCrashSale(true)}
                    disabled={selectedProducts.length === 0}
                    className="flex items-center gap-2 bg-[#FF3B30] text-white px-6 py-2 rounded-sm font-bold hover:bg-[#CC2F26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="activate-crash-sale"
                  >
                    <Zap size={18} />
                    Activate Crash Sale
                  </button>
                  
                  <button
                    onClick={() => handleCrashSale(false)}
                    disabled={selectedProducts.length === 0}
                    className="flex items-center gap-2 bg-[#00FF94] text-black px-6 py-2 rounded-sm font-bold hover:bg-[#00CC76] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="deactivate-crash-sale"
                  >
                    End Crash Sale
                  </button>
                </div>
              </motion.div>
            )}
            
            {!showForm ? null : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm mb-8"
          >
            <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors font-mono"
                    data-testid="increment-input"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#00FF94] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#00CC76] transition-colors"
                  data-testid="submit-product-button"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] py-3 rounded-sm font-bold hover:border-[#FF3B30] transition-colors"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
        
        <div>
          <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">All Products</h2>
          
          {loading ? (
            <div className="text-center py-16 text-[#A1A1AA]">Loading...</div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`bg-[#121212] border-2 rounded-sm flex items-center gap-6 p-6 transition-all ${
                    selectedProducts.includes(product.id) 
                      ? 'border-[#FF3B30] shadow-[0_0_20px_rgba(255,59,48,0.3)]' 
                      : product.crash_sale_active
                      ? 'border-[#FF3B30]'
                      : 'border-[#2A2A2A]'
                  }`}
                  data-testid="admin-product-item"
                >
                  {showCrashSalePanel && (
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProductSelection(product.id)}
                      className="w-6 h-6 rounded accent-[#FF3B30] cursor-pointer"
                      data-testid={`product-checkbox-${product.id}`}
                    />
                  )}
                  
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-sm"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-heading font-bold text-xl text-[#EDEDED]">{product.name}</h3>
                      {product.crash_sale_active && (
                        <span className="bg-[#FF3B30] text-white text-xs font-bold px-2 py-1 rounded-sm uppercase animate-pulse flex items-center gap-1">
                          <Zap size={12} />
                          Crash Sale
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#A1A1AA] mb-2">{product.category}</div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-[#A1A1AA]">Current: </span>
                        <span className="font-mono font-bold text-[#00FF94]">₹{product.current_price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#A1A1AA]">Base: </span>
                        <span className="font-mono font-bold text-[#EDEDED]">₹{product.base_price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#A1A1AA]">Max: </span>
                        <span className="font-mono font-bold text-[#EDEDED]">₹{product.max_retail_price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-[#A1A1AA]">Sales: </span>
                        <span className="font-mono font-bold text-[#EDEDED]">{product.purchase_count}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#00FF94] p-3 rounded-sm hover:bg-[#00FF94] hover:text-black transition-all"
                      data-testid="edit-product-button"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#FF3B30] p-3 rounded-sm hover:bg-[#FF3B30] hover:text-white transition-all"
                      data-testid="delete-product-button"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#A1A1AA]" data-testid="no-products-message">
              No products yet. Add your first product!
            </div>
          )}
        </div>
          </>
        )}
        
        {activeTab === 'admins' && (
          <>
            <div className="mb-8 flex gap-4">
              <button
                onClick={() => { setShowAdminForm(true); setShowPasswordForm(false); }}
                className="flex items-center gap-2 bg-[#FACC15] text-black px-6 py-3 rounded-sm font-bold hover:bg-[#e6b800] transition-colors"
                data-testid="show-add-admin-button"
              >
                <UserPlus size={20} />
                Add New Admin
              </button>
              <button
                onClick={() => { setShowPasswordForm(true); setShowAdminForm(false); }}
                className="flex items-center gap-2 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-6 py-3 rounded-sm font-bold hover:border-[#FACC15] transition-colors"
                data-testid="show-change-password-button"
              >
                <Key size={20} />
                Change My Password
              </button>
            </div>
            
            {showAdminForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm mb-8"
              >
                <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">Add New Admin</h2>
                
                <form onSubmit={handleAddAdmin} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Name *</label>
                      <input
                        type="text"
                        value={adminFormData.name}
                        onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                        placeholder="Admin Name"
                        className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                        data-testid="admin-name-input"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email *</label>
                      <input
                        type="email"
                        value={adminFormData.email}
                        onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                        placeholder="admin@example.com"
                        className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                        data-testid="admin-email-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Password *</label>
                    <input
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                      data-testid="admin-password-input"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#FACC15] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#e6b800] transition-colors"
                      data-testid="submit-admin-button"
                    >
                      Create Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAdminForm(false); setAdminFormData({ name: '', email: '', password: '' }); }}
                      className="px-8 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] py-3 rounded-sm font-bold hover:border-[#FF3B30] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            {showPasswordForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm mb-8"
              >
                <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">Change Password</h2>
                
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Current Password *</label>
                    <input
                      type="password"
                      value={passwordFormData.current_password}
                      onChange={(e) => setPasswordFormData({...passwordFormData, current_password: e.target.value})}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                      data-testid="current-password-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">New Password *</label>
                    <input
                      type="password"
                      value={passwordFormData.new_password}
                      onChange={(e) => setPasswordFormData({...passwordFormData, new_password: e.target.value})}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                      data-testid="new-password-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Confirm New Password *</label>
                    <input
                      type="password"
                      value={passwordFormData.confirm_password}
                      onChange={(e) => setPasswordFormData({...passwordFormData, confirm_password: e.target.value})}
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] px-4 py-3 rounded-sm focus:outline-none focus:border-[#FACC15] transition-colors"
                      data-testid="confirm-password-input"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-[#FACC15] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#e6b800] transition-colors"
                      data-testid="submit-password-change-button"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowPasswordForm(false); setPasswordFormData({ current_password: '', new_password: '', confirm_password: '' }); }}
                      className="px-8 bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] py-3 rounded-sm font-bold hover:border-[#FF3B30] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            
            <div>
              <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-6">All Admins</h2>
              
              {admins.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {admins.map((admin) => {
                    const currentAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
                    const isCurrentAdmin = admin.id === currentAdmin.id;
                    
                    return (
                      <motion.div
                        key={admin.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm flex items-center gap-6"
                        data-testid="admin-item"
                      >
                        <div className="bg-[#FACC15] p-3 rounded-sm">
                          <Shield className="text-black" size={32} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-heading font-bold text-xl text-[#EDEDED] mb-1">{admin.name}</h3>
                            {isCurrentAdmin && (
                              <span className="bg-[#00FF94] text-black text-xs font-bold px-2 py-1 rounded-sm uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[#A1A1AA]">{admin.email}</div>
                          <div className="text-xs text-[#52525B] mt-1">ID: {admin.id.slice(0, 8)}...</div>
                        </div>
                        
                        {!isCurrentAdmin && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="bg-[#1E1E1E] border border-[#2A2A2A] text-[#FF3B30] p-3 rounded-sm hover:bg-[#FF3B30] hover:text-white transition-all"
                            data-testid="delete-admin-button"
                            title="Delete admin"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 text-[#A1A1AA]">
                  No admins found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}