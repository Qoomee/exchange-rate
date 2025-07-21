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
  const [currentPeriod, setCurrentPeriod] = useState('');
  const [jcbUsd, setJcbUsd] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [newPeriod, setNewPeriod] = useState('');
  const [savedPeriods, setSavedPeriods] = useState<string[]>([]);
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });

  useEffect(() => {
    // 获取汇率数据
    fetch('/api/rates')
      .then(res => res.json())
      .then(data => {
        setExchangeRates(data);
        if (data[0]?.lastUpdated) {
          setCurrentPeriod(data[0].lastUpdated);
        }
      })
      .catch(error => console.error('Error fetching rates:', error));
    
    // Load saved periods from localStorage
    const saved = localStorage.getItem('savedPeriods');
    if (saved) {
      setSavedPeriods(JSON.parse(saved));
    }
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
    const hkdRate = exchangeRates.find(rate => rate.currency === 'HKD')?.rate;
    if (!hkdRate || hkdRate === 0) return '0.00';
    return (numUsd / hkdRate).toFixed(2);
  };

  // Admin functions
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAdminMessage('Login successful');
    } else {
      setAdminMessage('Incorrect password');
    }
  };

  const handleUpdateRate = (currency: string, newRate: string) => {
    const numRate = parseFloat(newRate);
    if (isNaN(numRate)) {
      setAdminMessage('Please enter a valid number');
      return;
    }
    
    const updatedRates = exchangeRates.map(rate => 
      rate.currency === currency 
        ? { ...rate, rate: numRate, lastUpdated: currentPeriod }
        : rate
    );
    
    setExchangeRates(updatedRates);
    setAdminMessage('Rate updated successfully');
  };

  const handleUpdatePeriod = (newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    const updatedRates = exchangeRates.map(rate => ({
      ...rate,
      lastUpdated: newPeriod
    }));
    setExchangeRates(updatedRates);
    setAdminMessage('Period updated successfully');
  };

  const handleSavePeriod = () => {
    if (!newPeriod.trim()) {
      setAdminMessage('Please enter a period name');
      return;
    }
    
    const periodData = {
      period: newPeriod,
      rates: exchangeRates,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(`period_${newPeriod}`, JSON.stringify(periodData));
    const updatedPeriods = [...savedPeriods, newPeriod];
    setSavedPeriods(updatedPeriods);
    localStorage.setItem('savedPeriods', JSON.stringify(updatedPeriods));
    
    setCurrentPeriod(newPeriod);
    setNewPeriod('');
    setAdminMessage(`Period ${newPeriod} saved successfully`);
  };

  const handleLoadPeriod = (period: string) => {
    const savedData = localStorage.getItem(`period_${period}`);
    if (savedData) {
      const periodData = JSON.parse(savedData);
      setExchangeRates(periodData.rates);
      setCurrentPeriod(period);
      setAdminMessage(`Period ${period} loaded successfully`);
    }
  };

  const handleSaveToAPI = async () => {
    try {
      const response = await fetch('/api/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exchangeRates),
      });
      
      if (response.ok) {
        setAdminMessage('Rates saved to API successfully');
      } else {
        setAdminMessage('Failed to save rates to API');
      }
    } catch {
      setAdminMessage('Error saving rates to API');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <div style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem'
      }}>
        <a 
          href="mailto:linfeng.zheng@vacationclub.com"
          style={{
            color: '#6b7280',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '0.9rem',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          Help
        </a>
      </div>
      <div style={{
        width: '100%',
        maxWidth: '48rem',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#d97706',
            borderBottom: '1px solid #fed7aa',
            color: 'white'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              {today}
            </div>
            <div style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '1rem',
              fontWeight: '600',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              display: 'inline-block'
            }}>
              {currentPeriod || 'Loading...'}
            </div>
            <h1 style={{ 
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              letterSpacing: '-0.025em'
            }}>
              MVCI Exchange Rate
            </h1>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}>
                    Package
                  </th>
                  <th style={{ 
                    padding: '0.75rem',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}>
                    Currency
                  </th>
                  <th style={{ 
                    padding: '0.75rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}>
                    Exchange Rate
                  </th>
                  <th style={{ 
                    padding: '0.75rem',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#374151',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem'
                  }}>
                    USD
                  </th>
                </tr>
              </thead>
              <tbody>
                {exchangeRates.map((rate, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                  }}>
                    <td style={{ 
                      padding: '0.75rem',
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>
                      {rate.currency === 'IDR' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            value={amounts[rate.currency] || ''}
                            onChange={(e) => handleAmountChange(rate.currency, e.target.value)}
                            style={{
                              width: 'calc(100% - 3rem)',
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              textAlign: 'right',
                              color: amounts[rate.currency] ? '#374151' : '#9CA3AF',
                              fontSize: '0.875rem'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#d97706';
                              e.target.style.outline = 'none';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#d1d5db';
                            }}
                            placeholder="3900"
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
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            textAlign: 'right',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.outline = 'none';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                          }}
                          placeholder="Amount"
                        />
                      )}
                    </td>
                    <td style={{ 
                      padding: '0.75rem',
                      color: '#374151',
                      whiteSpace: 'nowrap'
                    }}>
                      {rate.currency}
                    </td>
                    <td style={{ 
                      padding: '0.75rem',
                      textAlign: 'right',
                      color: '#374151',
                      whiteSpace: 'nowrap',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}>
                      {rate.rate.toFixed(5)}
                    </td>
                    <td style={{ 
                      padding: '0.75rem',
                      textAlign: 'right',
                      color: '#d97706',
                      whiteSpace: 'nowrap',
                      fontWeight: '600',
                      fontSize: '0.875rem'
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
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          padding: '1.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '1.5rem',
            color: '#374151'
          }}>
            JCB Convert
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>USD</th>
                  <th style={{ width: '2rem', borderBottom: '1px solid #e5e7eb' }}></th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>HKD</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <input
                      type="number"
                      value={jcbUsd}
                      onChange={(e) => setJcbUsd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        textAlign: 'right',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        color: '#374151'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#d97706';
                        e.target.style.outline = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                      placeholder="Enter USD amount"
                      step="0.01"
                    />
                  </td>
                  <td style={{ width: '2rem' }}></td>
                  <td style={{ 
                    padding: '0.75rem 1rem', 
                    textAlign: 'center', 
                    fontWeight: '600',
                    color: '#d97706',
                    fontSize: '0.875rem'
                  }}>
                    ${calculateJcbHkd(jcbUsd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div 
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#f3f4f6',
              borderBottom: isAdminOpen ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              margin: 0
            }}>
              Admin Settings
            </h3>
            <span style={{
              fontSize: '1.25rem',
              color: '#6b7280',
              transform: isAdminOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </div>

          {isAdminOpen && (
            <div style={{ padding: '1.5rem' }}>
              {!isAuthenticated ? (
                <form onSubmit={handleAdminLogin} style={{ marginBottom: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>Admin Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                      }}
                      placeholder="Enter admin password"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f97316';
                        e.target.style.outline = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#d97706',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b45309';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#d97706';
                    }}
                  >
                    Login
                  </button>
                </form>
              ) : (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#374151',
                      margin: 0
                    }}>Exchange Rate Management</h4>
                    <button
                      onClick={() => {
                        setIsAuthenticated(false);
                        setPassword('');
                        setAdminMessage('Logged out successfully');
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        border: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </div>

                  {/* Period Management */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h5 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '1rem'
                    }}>Period Management</h5>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>Current Period</label>
                        <input
                          type="text"
                          value={currentPeriod}
                          onChange={(e) => handleUpdatePeriod(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.outline = 'none';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d1d5db';
                          }}
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.25rem'
                        }}>Save New Period</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            value={newPeriod}
                            onChange={(e) => setNewPeriod(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem'
                            }}
                            placeholder="e.g., P6"
                            onFocus={(e) => {
                              e.target.style.borderColor = '#d97706';
                              e.target.style.outline = 'none';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#d1d5db';
                            }}
                          />
                          <button
                            onClick={handleSavePeriod}
                            style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '0.5rem 0.75rem',
                              border: 'none',
                              borderRadius: '0.375rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {savedPeriods.length > 0 && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          color: '#6b7280',
                          marginBottom: '0.5rem'
                        }}>Saved Periods</label>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem'
                        }}>
                          {savedPeriods.map((period) => (
                            <button
                              key={period}
                              onClick={() => handleLoadPeriod(period)}
                              style={{
                                backgroundColor: period === currentPeriod ? '#d97706' : '#f3f4f6',
                                color: period === currentPeriod ? 'white' : '#374151',
                                padding: '0.25rem 0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Exchange Rates */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem'
                    }}>
                      <h5 style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        margin: 0
                      }}>Exchange Rates</h5>
                      <button
                        onClick={handleSaveToAPI}
                        style={{
                          backgroundColor: '#d97706',
                          color: 'white',
                          padding: '0.375rem 0.75rem',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        Save to API
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'grid',
                      gap: '0.75rem'
                    }}>
                      {exchangeRates.map((rate) => (
                        <div key={rate.currency} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.75rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          <span style={{
                            minWidth: '3rem',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#374151'
                          }}>{rate.currency}</span>
                          <input
                            type="number"
                            value={rate.rate}
                            onChange={(e) => handleUpdateRate(rate.currency, e.target.value)}
                            style={{
                              flex: 1,
                              padding: '0.5rem',
                              border: '1px solid #d1d5db',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              textAlign: 'right'
                            }}
                            step="0.00001"
                            onFocus={(e) => {
                              e.target.style.borderColor = '#d97706';
                              e.target.style.outline = 'none';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = '#d1d5db';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Message */}
              {adminMessage && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: adminMessage.includes('successfully') ? '#dcfce7' : '#fef2f2',
                  border: `1px solid ${adminMessage.includes('successfully') ? '#bbf7d0' : '#fecaca'}`,
                  borderRadius: '0.375rem',
                  color: adminMessage.includes('successfully') ? '#166534' : '#dc2626',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {adminMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
