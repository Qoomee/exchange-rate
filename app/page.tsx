'use client';

import { useState, useEffect } from 'react';

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated?: string;
}

export default function Home() {
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [jcbUsd, setJcbUsd] = useState('');
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  useEffect(() => {
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => setExchangeRates(data))
      .catch(error => console.error('Error fetching rates:', error));
  }, []);

  const calculateResult = (amount: string, rate: number): string => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0.00';
    return (numAmount * rate).toFixed(2);
  };

  const handleAmountChange = (currency: string, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [currency]: value
    }));
  };

  const calculateJcbHkd = (usdAmount: string): string => {
    const numUsd = parseFloat(usdAmount);
    if (isNaN(numUsd)) return '0.00';
    const hkdRate = exchangeRates.find(rate => rate.currency === 'HKD')?.rate || 0;
    return (numUsd / hkdRate).toFixed(2);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFE5E5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem'
      }}>
        <a 
          href="mailto:linfeng.zheng@vacationclub.com"
          style={{
            color: '#4B5563',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          Help
        </a>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '42rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: '#F3F4F6'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '0.25rem' }}>
              Date: {today}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#4B5563',
              marginBottom: '0.5rem'
            }}>
              P3
            </div>
            <h1 style={{ 
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#1F2937'
            }}>
              MVCI Exchange Rate
            </h1>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>Package</th>
                  <th style={{ width: '2rem', borderBottom: '1px solid #E5E7EB' }}></th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>Currency</th>
                  <th style={{ width: '2rem', borderBottom: '1px solid #E5E7EB' }}></th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>Rate</th>
                  <th style={{ width: '2rem', borderBottom: '1px solid #E5E7EB' }}></th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>USD</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.map((rate) => (
                  <tr key={rate.currency} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {rate.currency === 'IDR' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            value={amounts[rate.currency] || ''}
                            onChange={(e) => handleAmountChange(rate.currency, e.target.value)}
                            style={{
                              width: 'calc(100% - 3rem)',
                              padding: '0.5rem',
                              border: '1px solid #E5E7EB',
                              borderRadius: '0.375rem',
                              textAlign: 'right'
                            }}
                            placeholder="Amount"
                          />
                          <span style={{ color: '#4B5563', fontWeight: '500' }}>,000</span>
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={amounts[rate.currency] || ''}
                          onChange={(e) => handleAmountChange(rate.currency, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #E5E7EB',
                            borderRadius: '0.375rem',
                            textAlign: 'right'
                          }}
                          placeholder="Amount"
                        />
                      )}
                    </td>
                    <td style={{ width: '2rem' }}></td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: '500', color: '#374151' }}>
                      {rate.currency}
                    </td>
                    <td style={{ width: '2rem' }}></td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#4B5563' }}>
                      {rate.rate.toFixed(5)}
                    </td>
                    <td style={{ width: '2rem' }}></td>
                    <td style={{ 
                      padding: '1rem 1.5rem', 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      backgroundColor: calculateResult(amounts[rate.currency] || '', rate.rate) !== '0.00' ? '#FEF3C7' : 'transparent'
                    }}>
                      ${calculateResult(amounts[rate.currency] || '', rate.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{
          backgroundColor: '#A5E6E0',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            JCB Convert
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F3F4F6' }}>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>USD</th>
                  <th style={{ width: '2rem', borderBottom: '1px solid #E5E7EB' }}></th>
                  <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#4B5563', borderBottom: '1px solid #E5E7EB' }}>HKD</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <input
                      type="number"
                      value={jcbUsd}
                      onChange={(e) => setJcbUsd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.375rem',
                        textAlign: 'right'
                      }}
                      placeholder="Enter USD amount"
                      step="0.01"
                    />
                  </td>
                  <td style={{ width: '2rem' }}></td>
                  <td style={{ 
                    padding: '1rem 1.5rem', 
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    color: '#374151'
                  }}>
                    ${calculateJcbHkd(jcbUsd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 