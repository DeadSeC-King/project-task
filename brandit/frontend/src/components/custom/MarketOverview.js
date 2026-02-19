import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const MarketOverview = () => {
  const [marketData, setMarketData] = useState([]);
  const [stats, setStats] = useState({ total_products: 0, crash_sales_active: 0, total_volume: 0 });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, statsRes] = await Promise.all([
          axios.get(`${API}/products`),
          axios.get(`${API}/market/stats`)
        ]);
        
        setStats(statsRes.data);
        
        const products = productsRes.data;
        const chartData = [];
        const now = Date.now();
        
        for (let i = 23; i >= 0; i--) {
          const timestamp = now - (i * 3600000);
          const avgPrice = products.reduce((sum, p) => sum + p.current_price, 0) / (products.length || 1);
          const variance = (Math.random() - 0.5) * 100;
          chartData.push({
            time: new Date(timestamp).getHours() + ':00',
            value: avgPrice + variance
          });
        }
        
        setMarketData(chartData);
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative" data-testid="market-overview">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      <div className="relative px-4 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="font-heading text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#EDEDED] mb-4" data-testid="market-title">
              BRAND IT
            </h1>
            <p className="text-lg text-[#A1A1AA] max-w-2xl">
              Premium digital products with dynamic pricing. Buy now or watch prices surge with demand.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Products</div>
              <div className="font-mono text-3xl font-bold text-[#00FF94]" data-testid="total-products">{stats.total_products}</div>
            </div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Crash Sales</div>
              <div className="font-mono text-3xl font-bold text-[#FF3B30]" data-testid="crash-sales">{stats.crash_sales_active}</div>
            </div>
            <div className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-sm">
              <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-1">Volume</div>
              <div className="font-mono text-3xl font-bold text-[#FACC15]" data-testid="total-volume">{stats.total_volume}</div>
            </div>
          </div>
          
          <div className="bg-[#121212] border border-[#2A2A2A] p-6 rounded-sm">
            <div className="text-xs text-[#A1A1AA] uppercase tracking-wider mb-4">Market Index (24h)</div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={marketData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  stroke="#A1A1AA" 
                  style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis 
                  stroke="#A1A1AA" 
                  style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
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
                  dataKey="value" 
                  stroke="#00FF94" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};