import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
  ];

  const fetchConversion = async (inputAmount, from, to) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/currency/convert?amount=${inputAmount}&from=${from}&to=${to}`
      );
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch currency data. Please try again.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }
    
    fetchConversion(numAmount, fromCurrency, toCurrency);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    if (data) {
      fetchConversion(parseFloat(amount), toCurrency, fromCurrency);
    }
  };

  // Auto-convert on currency change
  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      fetchConversion(parseFloat(amount), fromCurrency, toCurrency);
    }
  }, [fromCurrency, toCurrency]);

  const getCurrencySymbol = (code) => {
    return currencies.find(c => c.code === code)?.symbol || code;
  };

  const getCurrencyName = (code) => {
    return currencies.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="module currency-module">
      <h2>💱 Currency Converter</h2>
      <p className="module-subtitle">Convert between 20+ major world currencies</p>

      <form onSubmit={handleConvert} className="currency-form">
        <div className="input-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="currency-input"
            min="0"
            step="0.01"
          />
        </div>

        <div className="currency-selection-group">
          <div className="input-group">
            <label htmlFor="fromCurrency">From</label>
            <select
              id="fromCurrency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            type="button" 
            onClick={handleSwap}
            className="swap-button"
            title="Swap currencies"
          >
            ⇅ <p>To</p>
          </button>

          <div className="input-group">
            <label htmlFor="toCurrency">To</label>
            <select
              id="toCurrency"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="currency-select"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="convert-button" disabled={isLoading}>
          {isLoading ? 'Converting...' : 'Convert'}
        </button>
      </form>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching latest rates...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {data && !isLoading && !error && (
        <div className="currency-results">
          <div className="result-card source">
            <span className="currency-label">{getCurrencyName(data.from)}</span>
            <span className="currency-amount">
              {getCurrencySymbol(data.from)} {data.fromAmount.toFixed(2)}
            </span>
            <span className="currency-code">{data.from}</span>
          </div>

          <div className="conversion-arrow">→</div>

          <div className="result-cards-group">
            <div className="result-card">
              <span className="currency-label">{getCurrencyName(data.to)}</span>
              <span className="currency-amount">
                {getCurrencySymbol(data.to)} {data.toAmount.toFixed(2)}
              </span>
              <span className="currency-code">{data.to}</span>
              <span className="exchange-rate">Rate: {data.rate.toFixed(4)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencyConverter;
