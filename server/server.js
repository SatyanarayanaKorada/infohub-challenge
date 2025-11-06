const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Mock quotes data
const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is never too late to be what you might have been.", author: "George Eliot" }
];

// 1. Health Check
app.get('/api/health', (req, res) => {
    console.log('✅ Health check requested');
    res.json({ 
        status: 'Server is running', 
        timestamp: new Date().toISOString(),
        endpoints: [
            '/api/health', 
            '/api/quote', 
            '/api/weather', 
            '/api/weather/coords',
            '/api/currency',
            '/api/currency/convert'
        ]
    });
});

// 2. Quote API
app.get('/api/quote', async (req, res) => {
    try {
        console.log('📝 Quote requested');
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        console.log('✅ Quote sent:', randomQuote.author);
        res.json(randomQuote);
    } catch (error) {
        console.error('❌ Quote API Error:', error.message);
        res.status(500).json({ error: 'Could not fetch quote data.' });
    }
});

// 3. Weather API (by city name)
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city || 'London';
        const API_KEY = process.env.WEATHER_API_KEY || '0ed761300de2fbc6365b920d9df9108c';
        
        console.log(`🌤️  Weather requested for: ${city}`);
        console.log(`🔑 Using API Key: ${API_KEY.substring(0, 8)}...`);
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        console.log(`📡 Fetching from: ${url.substring(0, 80)}...`);
        
        const response = await axios.get(url);

        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: Math.round(response.data.main.temp),
            feelsLike: Math.round(response.data.main.feels_like),
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            icon: response.data.weather[0].icon
        };

        console.log(`✅ Weather data sent for ${weatherData.city}, ${weatherData.country}`);
        res.json(weatherData);
    } catch (error) {
        console.error('❌ Weather API Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            if (error.response.status === 404) {
                return res.status(404).json({ error: 'City not found. Please check the city name.' });
            }
            if (error.response.status === 401) {
                return res.status(500).json({ error: 'Invalid API key. Please check your configuration.' });
            }
        }
        res.status(500).json({ error: 'Could not fetch weather data. Please try again.' });
    }
});

// 4. Weather API (by coordinates - for geolocation)
app.get('/api/weather/coords', async (req, res) => {
    try {
        const lat = req.query.lat;
        const lon = req.query.lon;
        
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required.' });
        }

        const API_KEY = process.env.WEATHER_API_KEY || '0ed761300de2fbc6365b920d9df9108c';
        
        console.log(`🌤️ Weather requested for coordinates: ${lat}, ${lon}`);
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const weatherData = {
            city: response.data.name,
            country: response.data.sys.country,
            temperature: Math.round(response.data.main.temp),
            feelsLike: Math.round(response.data.main.feels_like),
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            icon: response.data.weather[0].icon
        };

        console.log(`✅ Weather data sent for ${weatherData.city}, ${weatherData.country}`);
        res.json(weatherData);
    } catch (error) {
        console.error('❌ Weather API Error:', error.message);
        res.status(500).json({ error: 'Could not fetch weather data for the given coordinates.' });
    }
});

// 5. Currency API (Old endpoint - INR to USD/EUR only)
app.get('/api/currency', async (req, res) => {
    try {
        const amount = parseFloat(req.query.amount) || 100;
        console.log(`💱 Currency conversion requested for INR ${amount}`);

        if (isNaN(amount) || amount <= 0) {
            console.warn('⚠️  Invalid amount provided');
            return res.status(400).json({ error: 'Invalid amount. Please provide a positive number.' });
        }

        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/INR');
        
        const rates = response.data.rates;
        const usd = (amount * rates.USD).toFixed(2);
        const eur = (amount * rates.EUR).toFixed(2);

        console.log(`✅ Conversion sent: INR ${amount} = USD ${usd}, EUR ${eur}`);
        
        res.json({
            inr: amount,
            usd: parseFloat(usd),
            eur: parseFloat(eur),
            rates: {
                usd: rates.USD.toFixed(4),
                eur: rates.EUR.toFixed(4)
            }
        });
    } catch (error) {
        console.error('❌ Currency API Error:', error.message);
        res.status(500).json({ error: 'Could not fetch currency data.' });
    }
});

// 6. Universal Currency Converter API - NEW ENDPOINT
app.get('/api/currency/convert', async (req, res) => {
    try {
        const amount = parseFloat(req.query.amount);
        const from = (req.query.from || 'INR').toUpperCase();
        const to = (req.query.to || 'USD').toUpperCase();

        console.log(`💱 Universal currency conversion: ${amount} ${from} → ${to}`);

        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            console.warn('⚠️  Invalid amount provided');
            return res.status(400).json({ error: 'Invalid amount. Please provide a positive number.' });
        }

        // Validate currency codes
        if (!from || !to) {
            return res.status(400).json({ error: 'Both from and to currencies are required.' });
        }

        console.log(`📡 Fetching exchange rates for ${from}...`);

        // Fetch exchange rates from external API
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
        
        console.log(`✅ Exchange rates fetched successfully`);

        const rate = response.data.rates[to];
        
        if (!rate) {
            console.error(`❌ Currency ${to} not found in rates`);
            return res.status(400).json({ error: `Unable to convert from ${from} to ${to}` });
        }
        
        const convertedAmount = amount * rate;

        const result = {
            from: from,
            to: to,
            fromAmount: parseFloat(amount),
            toAmount: parseFloat(convertedAmount.toFixed(2)),
            rate: parseFloat(rate.toFixed(6)),
            timestamp: new Date().toISOString()
        };

        console.log(`✅ Conversion successful: ${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`);
        console.log(`   Exchange rate: 1 ${from} = ${rate.toFixed(6)} ${to}`);
        
        res.json(result);

    } catch (error) {
        console.error('❌ Currency Conversion API Error:', error.message);
        
        if (error.response) {
            console.error('   Response status:', error.response.status);
            console.error('   Response data:', error.response.data);
        }
        
        res.status(500).json({ 
            error: 'Could not fetch currency data. Please try again later.',
            details: error.message 
        });
    }
});

// Handle 404 for undefined routes
app.use((req, res) => {
    console.warn(`⚠️  404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /api/health',
            'GET /api/quote',
            'GET /api/weather?city=CityName',
            'GET /api/weather/coords?lat=LAT&lon=LON',
            'GET /api/currency?amount=100',
            'GET /api/currency/convert?amount=100&from=INR&to=USD'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Global error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🚀 InfoHub Server is running on http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📡 API endpoints available:');
    console.log(`   ✓ GET http://localhost:${PORT}/api/health`);
    console.log(`   ✓ GET http://localhost:${PORT}/api/quote`);
    console.log(`   ✓ GET http://localhost:${PORT}/api/weather?city=London`);
    console.log(`   ✓ GET http://localhost:${PORT}/api/weather/coords?lat=28.6139&lon=77.2090`);
    console.log(`   ✓ GET http://localhost:${PORT}/api/currency?amount=100`);
    console.log(`   ✓ GET http://localhost:${PORT}/api/currency/convert?amount=100&from=INR&to=USD`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 Server is ready to accept requests!');
    console.log('');
});
