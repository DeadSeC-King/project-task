import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  
  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/send-otp`, {
        phone_number: phoneNumber
      });
      setGeneratedOtp(response.data.otp);
      toast.success(`OTP sent! (Demo: ${response.data.otp})`);
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone_number: phoneNumber,
        otp: otp
      });
      
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/marketplace');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" data-testid="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tighter uppercase text-[#EDEDED] mb-4">
            SECURE ACCESS
          </h1>
          <p className="text-lg text-[#A1A1AA]">
            {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your phone'}
          </p>
        </div>
        
        <div className="bg-[#121212] border border-[#2A2A2A] p-8 rounded-sm">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors"
                    data-testid="phone-input"
                  />
                </div>
              </div>
              
              <button
                onClick={sendOTP}
                disabled={loading}
                className="w-full bg-[#00FF94] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#00CC76] transition-colors disabled:opacity-50"
                data-testid="send-otp-button"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Enter OTP</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#A1A1AA]" size={20} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED] pl-12 pr-4 py-3 rounded-sm focus:outline-none focus:border-[#00FF94] transition-colors font-mono text-2xl tracking-widest text-center"
                    data-testid="otp-input"
                  />
                </div>
                {generatedOtp && (
                  <div className="mt-2 text-xs text-[#A1A1AA] text-center">
                    Demo OTP: <span className="font-mono text-[#00FF94]">{generatedOtp}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={verifyOTP}
                disabled={loading}
                className="w-full bg-[#00FF94] text-black py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-[#00CC76] transition-colors disabled:opacity-50"
                data-testid="verify-otp-button"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              
              <button
                onClick={() => setStep('phone')}
                className="w-full text-[#A1A1AA] hover:text-[#00FF94] text-sm transition-colors"
                data-testid="change-number-button"
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center text-sm text-[#A1A1AA]">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </motion.div>
    </div>
  );
}