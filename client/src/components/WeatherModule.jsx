import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function WeatherModule() {
  const [city, setCity] = useState('London');
  const [searchInput, setSearchInput] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  const fetchWeather = async (cityName) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/weather?city=${encodeURIComponent(cityName)}`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data. Please try again.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setIsLoading(true);
    setError('');

    try {
      // You'll need to add this endpoint to your backend
      const response = await axios.get(`${API_BASE_URL}/api/weather/coords?lat=${lat}&lon=${lon}`);
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data. Please try again.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocationLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
        setIsLocationLoading(false);
      },
      (error) => {
        let errorMsg = 'Unable to get your location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Location access was denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'An unknown error occurred.';
        }
        
        setError(errorMsg);
        setIsLocationLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      setSearchInput('');
    }
  };

  return (
    <div className="module weather-module">
      <h2>🌤️ Weather Information</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Enter city name..."
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
        <button 
          type="button" 
          onClick={getCurrentLocationWeather}
          className="location-button"
          disabled={isLocationLoading}
          title="Use my current location"
        >
          {isLocationLoading ? '⏳' : '📍'}
        </button>
      </form>

      {(isLoading || isLocationLoading) && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{isLocationLoading ? 'Getting your location...' : 'Loading weather data...'}</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {data && !isLoading && !error && (
        <div className="weather-content">
          <div className="weather-header">
            <h3>{data.city}, {data.country}</h3>
          </div>
          
          <div className="weather-main">
            <img 
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} 
              alt={data.description}
              className="weather-icon"
            />
            <div className="temperature">{data.temperature}°C</div>
            <div className="description">{data.description}</div>
          </div>

          <div className="weather-details">
            <div className="detail-card">
              <span className="detail-label">Feels Like</span>
              <span className="detail-value">{data.feelsLike}°C</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Humidity</span>
              <span className="detail-value">{data.humidity}%</span>
            </div>
            <div className="detail-card">
              <span className="detail-label">Wind Speed</span>
              <span className="detail-value">{data.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherModule;
