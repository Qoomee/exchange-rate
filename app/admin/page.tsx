'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/rates')
        .then(res => res.json())
        .then(data => {
          setExchangeRates(data);
          if (data[0]?.lastUpdated) {
            setLastUpdated(data[0].lastUpdated);
          }
        })
        .catch(error => console.error('Error fetching rates:', error));
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      setMessage('Incorrect password');
    }
  };

  const handleUpdateRate = (currency: string, newRate: string) => {
    const numRate = parseFloat(newRate);
    if (isNaN(numRate)) {
      setMessage('Please enter a valid number');
      return;
    }
    
    const updatedRates = exchangeRates.map(rate => 
      rate.currency === currency 
        ? { ...rate, rate: numRate, lastUpdated }
        : rate
    );
    
    setExchangeRates(updatedRates);
    setMessage('Rate updated successfully');
  };

  const handleUpdateTime = (newTime: string) => {
    setLastUpdated(newTime);
    const updatedRates = exchangeRates.map(rate => ({
      ...rate,
      lastUpdated: newTime
    }));
    setExchangeRates(updatedRates);
    setMessage('Update time changed successfully');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFE5E5' }}>
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter password"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
          {message && <p className="text-red-500 mt-2 text-center">{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FFE5E5' }}>
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="flex justify-between items-center w-full mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Exchange Rate Management</h1>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
          
          <div className="w-full mb-6">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow">
              <span className="w-full md:w-24 text-center md:text-left">P Value</span>
              <input
                type="text"
                value={lastUpdated}
                onChange={(e) => handleUpdateTime(e.target.value)}
                className="w-full md:w-48 p-2 border rounded"
                placeholder="e.g., P4, P5, PX"
              />
            </div>
          </div>

          <div className="w-full space-y-4">
            {exchangeRates.map((rate) => (
              <div key={rate.currency} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 p-4 bg-white rounded-lg shadow">
                <span className="w-full md:w-24 text-center md:text-left">{rate.currency}</span>
                <input
                  type="number"
                  value={rate.rate}
                  onChange={(e) => handleUpdateRate(rate.currency, e.target.value)}
                  className="w-full md:w-48 p-2 border rounded"
                  step="0.00001"
                />
              </div>
            ))}
            {message && <p className="text-green-500 text-center">{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 