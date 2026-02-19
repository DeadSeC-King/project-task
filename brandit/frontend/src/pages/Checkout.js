import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRazorpay } from 'react-razorpay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Checkout() {
  const navigate = useNavigate();
  const [Razorpay] = useRazorpay();
  const [email, setEmail] = useState('');
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (!savedUser) {
      navigate('/login');
      return;
    }
    
    if (savedCart.length === 0) {
      navigate('/cart');
      return;
    }
    
    setUser(savedUser);
    setCart(savedCart);
    setEmail(savedUser.email || '');
  }, [navigate]);
  
  const total = cart.reduce((sum, item) => sum + (item.current_price * item.quantity), 0);
  
  const handlePayment = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const products = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.current_price,
        quantity: item.quantity
      }));
      
      const orderResponse = await axios.post(`${API}/orders/create`, {
        user_id: user.id,
        email: email,
        products: products
      });
      
      const { order_id, razorpay_order_id, amount, key_id } = orderResponse.data;
      
      const options = {
        key: key_id,
        amount: amount * 100,
        currency: "INR",
        name: "Digital Exchange",
        description: "Digital Product Purchase",
        order_id: razorpay_order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API}/orders/verify-payment`, {
              order_id: order_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            localStorage.removeItem('cart');
            setPaymentSuccess(true);
            toast.success('Payment successful!');
            setTimeout(() => navigate('/dashboard'), 3000);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error(error);
          }
        },
        prefill: {
          name: user.name || '',
          email: email,
          contact: user.phone_number
        },
        theme: {
          color: "#00FF94"
        }
      };
      
      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
      
      razorpayInstance.on('payment.failed', function (response) {
        toast.error('Payment failed');
        console.error(response);
      });
      
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="payment-success">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="mx-auto text-[#00FF94] mb-6" size={80} />
          <h2 className="font-heading text-4xl font-bold text-[#EDEDED] mb-4">PAYMENT SUCCESSFUL!</h2>
          <p className="text-lg text-[#A1A1AA] mb-2">Your order has been placed successfully</p>
          <p className="text-sm text-[#A1A1AA]">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12" data-testid="checkout-page">
      <div className="max-w-4xl mx-auto px-4 md:px-12">
        <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-8">
          CHECKOUT
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm mb-6">
              <h2 className="font-heading text-2xl font-bold text-[#EDEDED] mb-6">Contact Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={user?.phone_number || ''}
                    disabled
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#A1A1AA] px-4 py-3 rounded-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors"
                      data-testid="email-input"
                    />
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1">Order confirmation will be sent to this email</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
              <h2 className="font-heading text-2xl font-bold text-[#EDEDED] mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 text-[#A1A1AA]">
                <CreditCard size={24} />
                <span>Razorpay (Cards, UPI, Wallets)</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm sticky top-8">
              <h2 className="font-heading text-2xl font-bold text-[#EDEDED] mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-sm"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-[#EDEDED] text-sm">{item.name}</div>
                      <div className="text-xs text-[#A1A1AA]">Qty: {item.quantity}</div>
                      <div className="font-mono text-sm text-[#00FF94]">
                        ₹{(item.current_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#2A2A2A] pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-[#A1A1AA]">Subtotal</span>
                  <span className="font-mono text-[#EDEDED]">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-[#A1A1AA]">Processing Fee</span>
                  <span className="font-mono text-[#EDEDED]">₹0.00</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-[#2A2A2A]">
                  <span className="text-[#A1A1AA] uppercase text-sm tracking-wider">Total</span>
                  <div className="font-mono text-3xl font-bold text-[#00FF94]" data-testid="checkout-total">
                    ₹{total.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#00FF94] text-black py-4 rounded-sm font-heading font-bold text-lg uppercase tracking-wider hover:bg-[#00CC76] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="pay-now-button"
              >
                {loading ? 'Processing...' : (
                  <>
                    <CreditCard size={20} />
                    Pay ₹{total.toFixed(2)}
                  </>
                )}
              </button>
              
              <div className="mt-4 text-xs text-center text-[#A1A1AA]">
                Secured by Razorpay. Your payment information is encrypted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}