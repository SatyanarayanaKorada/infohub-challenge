// client/src/App.jsx
import React, { useState } from 'react';
import QuoteGenerator from './components/QuoteGenerator.jsx';
import WeatherModule from './components/WeatherModule.jsx';
import CurrencyConverter from './components/CurrencyConverter';
import './App.css'; // You can style your tabs here

function App() {
    // 'quote' is the default active tab
    const [activeTab, setActiveTab] = useState('quote');

    return (
        <div className="info-hub">
            <header>
                <h1>InfoHub Dashboard</h1>
                <nav className="nav-btn">
                    <button onClick={() => setActiveTab('quote')}>Quote</button>
                    <button onClick={() => setActiveTab('weather')}>Weather</button>
                    <button onClick={() => setActiveTab('currency')}>Converter</button>
                </nav>
            </header>

            <main>
                {/* Conditional Rendering */}
                {activeTab === 'quote' && <QuoteGenerator />}
                {activeTab === 'weather' && <WeatherModule />}
                {activeTab === 'currency' && <CurrencyConverter />}
            </main>
            <footer className="app-footer">
                <p>&copy; 2025 Satyanarayana. All rights reserved.</p>
            </footer>

        </div>
        
    );
}

export default App;