import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);
  
  const updateQuantity = (productId, delta) => {
    const updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  
  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success('Item removed from cart');
  };
  
  const total = cart.reduce((sum, item) => sum + (item.current_price * item.quantity), 0);
  
  const proceedToCheckout = () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="empty-cart">
        <div className="text-center">
          <ShoppingBag className="mx-auto text-[#A1A1AA] mb-4" size={64} />
          <h2 className="font-heading text-3xl font-bold text-[#EDEDED] mb-2">Your cart is empty</h2>
          <p className="text-[#A1A1AA] mb-6">Add some products to get started</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-[#00FF94] text-black px-6 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#00CC76] transition-colors"
            data-testid="browse-products-button"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12" data-testid="cart-page">
      <div className="max-w-5xl mx-auto px-4 md:px-12">
        <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-8">
          YOUR CART
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm"
                data-testid="cart-item"
              >
                <div className="flex gap-4">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-sm"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-[#EDEDED] mb-1">{item.name}</h3>
                    <div className="text-xs text-[#A1A1AA] uppercase mb-2">{item.category}</div>
                    <div className="font-mono text-xl font-bold text-[#00FF94]">
                      ₹{item.current_price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#FF3B30] hover:text-[#CC2F26] transition-colors"
                      data-testid="remove-item-button"
                    >
                      <Trash2 size={20} />
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-[#1E1E1E] border border-[#2A2A2A] p-2 rounded-sm hover:border-[#00FF94] transition-colors"
                        data-testid="decrease-quantity-button"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-mono font-bold w-8 text-center" data-testid="item-quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-[#1E1E1E] border border-[#2A2A2A] p-2 rounded-sm hover:border-[#00FF94] transition-colors"
                        data-testid="increase-quantity-button"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm sticky top-8">
              <h2 className="font-heading text-2xl font-bold text-[#EDEDED] mb-6">ORDER SUMMARY</h2>
              
              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#A1A1AA]">{item.name} x{item.quantity}</span>
                    <span className="font-mono text-[#EDEDED]">₹{(item.current_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#2A2A2A] pt-4 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-[#A1A1AA] uppercase text-sm tracking-wider">Total</span>
                  <div className="font-mono text-3xl font-bold text-[#00FF94]" data-testid="cart-total">
                    ₹{total.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={proceedToCheckout}
                className="w-full bg-[#00FF94] text-black py-4 rounded-sm font-heading font-bold text-lg uppercase tracking-wider hover:bg-[#00CC76] transition-colors"
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </button>
              
              <button
                onClick={() => navigate('/marketplace')}
                className="w-full mt-3 text-[#A1A1AA] hover:text-[#00FF94] text-sm transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}