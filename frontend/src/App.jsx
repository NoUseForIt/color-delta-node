import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => console.error('API error:', err));
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#e8e8e8',
      fontFamily: "'DM Mono', monospace"
    }}>
      <div style={{
        background: '#fff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontFamily: "'Syne', sans-serif", 
          fontSize: '24px', 
          color: '#2a6abf',
          marginBottom: '10px'
        }}>
          Δ Color Delta V5
        </h1>
        <p style={{ fontSize: '12px', color: '#7a8ea8', marginBottom: '20px' }}>
          CORRECTION COLORIMÉTRIQUE RIP
        </p>
        
        {health ? (
          <div style={{ 
            background: '#e8f0fa', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #b8cfee'
          }}>
            <div style={{ fontSize: '14px', color: '#2a6abf', marginBottom: '8px' }}>
              ✓ Backend connecté
            </div>
            <pre style={{ fontSize: '11px', color: '#4a5a70', margin: 0 }}>
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#9a6010' }}>
            ⏳ Connexion au backend...
          </div>
        )}
        
        <div style={{ 
          marginTop: '20px', 
          fontSize: '11px', 
          color: '#7a8ea8' 
        }}>
          Phase 1 complétée — Prêt pour Phase 2
        </div>
      </div>
    </div>
  );
}

export default App;
