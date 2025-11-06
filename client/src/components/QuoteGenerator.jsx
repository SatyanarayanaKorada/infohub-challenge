import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function QuoteGenerator() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuote = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/quote`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch quote. Please try again.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="module quote-module">
      <h2>💭 Motivational Quote</h2>
      <p className="module-subtitle">Get inspired with a new quote</p>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading quote...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {data && !isLoading && !error && (
        <div className="quote-content">
          <div className="quote-box">
            <div className="quote-icon">"</div>
            <p className="quote-text">{data.text}</p>
            <p className="quote-author">— {data.author}</p>
          </div>
        </div>
      )}

      <button onClick={fetchQuote} className="new-quote-button" disabled={isLoading}>
        {isLoading ? 'Loading...' : '🔄 Get New Quote'}
      </button>
    </div>
  );
}

export default QuoteGenerator;
