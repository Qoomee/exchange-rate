'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ExchangeRate {
  currency: string;
  rate: number;
  lastUpdated?: string;
}

interface PeriodData {
  period: string;
  rates: ExchangeRate[];
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [message, setMessage] = useState('');
  const [currentPeriod, setCurrentPeriod] = useState('P5');
  const [newPeriod, setNewPeriod] = useState('');
  const [savedPeriods, setSavedPeriods] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
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
        ? { ...rate, rate: numRate, lastUpdated: currentPeriod }
        : rate
    );
    
    setExchangeRates(updatedRates);
    setMessage('Rate updated successfully');
  };

  const handleUpdatePeriod = (newPeriod: string) => {
    setCurrentPeriod(newPeriod);
    const updatedRates = exchangeRates.map(rate => ({
      ...rate,
      lastUpdated: newPeriod
    }));
    setExchangeRates(updatedRates);
    setMessage('Period updated successfully');
  };

  const handleSavePeriod = () => {
    if (!newPeriod.trim()) {
      setMessage('Please enter a period name');
      return;
    }
    
    const periodData: PeriodData = {
      period: newPeriod,
      rates: exchangeRates,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(`period_${newPeriod}`, JSON.stringify(periodData));
    
    // Update saved periods list
    const updatedPeriods = [...savedPeriods, newPeriod];
    setSavedPeriods(updatedPeriods);
    localStorage.setItem('savedPeriods', JSON.stringify(updatedPeriods));
    
    setCurrentPeriod(newPeriod);
    setNewPeriod('');
    setMessage(`Period ${newPeriod} saved successfully`);
  };

  const handleLoadPeriod = (period: string) => {
    const savedData = localStorage.getItem(`period_${period}`);
    if (savedData) {
      const periodData: PeriodData = JSON.parse(savedData);
      setExchangeRates(periodData.rates);
      setCurrentPeriod(period);
      setMessage(`Period ${period} loaded successfully`);
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
        setMessage('Rates saved to API successfully');
      } else {
        setMessage('Failed to save rates to API');
      }
    } catch (error) {
      setMessage('Error saving rates to API');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      }}>
        <form onSubmit={handleLogin} style={{
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: '#4f46e5',
            letterSpacing: '-0.025em'
          }}>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid rgba(79, 70, 229, 0.2)',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}
            placeholder="Enter password"
            onFocus={(e) => {
              e.target.style.borderColor = '#4f46e5';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '1rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.4)';
            }}
          >
            Login
          </button>
          {message && <p style={{
            color: '#ef4444',
            marginTop: '1rem',
            textAlign: 'center',
            fontWeight: '500'
          }}>{message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '56rem',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: '700',
            color: '#4f46e5',
            letterSpacing: '-0.025em',
            margin: 0
          }}>Exchange Rate Management</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
          >
            Logout
          </button>
        </div>

        {/* Period Management */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#4f46e5',
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em'
          }}>Period Management</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Current Period */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#4f46e5',
                marginBottom: '0.5rem'
              }}>Current Period</label>
              <input
                type="text"
                value={currentPeriod}
                onChange={(e) => handleUpdatePeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid rgba(79, 70, 229, 0.2)',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                placeholder="e.g., P6, P7, P8"
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Save New Period */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#4f46e5',
                marginBottom: '0.5rem'
              }}>Save New Period</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid rgba(79, 70, 229, 0.2)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }}
                  placeholder="e.g., P6"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={handleSavePeriod}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Saved Periods */}
          {savedPeriods.length > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#4f46e5',
                marginBottom: '0.5rem'
              }}>Load Saved Period</label>
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
                      background: period === currentPeriod 
                        ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                        : 'rgba(79, 70, 229, 0.1)',
                      color: period === currentPeriod ? 'white' : '#4f46e5',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      border: '2px solid rgba(79, 70, 229, 0.2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontSize: '0.9rem'
                    }}
                    onMouseEnter={(e) => {
                      if (period !== currentPeriod) {
                        e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
                        e.currentTarget.style.borderColor = '#4f46e5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (period !== currentPeriod) {
                        e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                      }
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
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#4f46e5',
              letterSpacing: '-0.025em',
              margin: 0
            }}>Exchange Rates</h2>
            <button
              onClick={handleSaveToAPI}
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
              }}
            >
              Save to API
            </button>
          </div>
          
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {exchangeRates.map((rate) => (
              <div key={rate.currency} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(79, 70, 229, 0.05)',
                borderRadius: '0.75rem',
                border: '2px solid rgba(79, 70, 229, 0.1)',
                transition: 'all 0.2s ease'
              }}>
                <span style={{
                  minWidth: '4rem',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#4f46e5'
                }}>{rate.currency}</span>
                <input
                  type="number"
                  value={rate.rate}
                  onChange={(e) => handleUpdateRate(rate.currency, e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid rgba(79, 70, 229, 0.2)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    textAlign: 'right'
                  }}
                  step="0.00001"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5';
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(79, 70, 229, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div style={{
            backgroundColor: message.includes('successfully') 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)',
            border: `2px solid ${message.includes('successfully') 
              ? 'rgba(16, 185, 129, 0.3)' 
              : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '0.75rem',
            padding: '1rem',
            textAlign: 'center',
            color: message.includes('successfully') ? '#059669' : '#dc2626',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}