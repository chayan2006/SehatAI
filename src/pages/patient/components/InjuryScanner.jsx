import React, { useState, useRef } from 'react';
import './InjuryScanner.css';

export default function InjuryScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc).');
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/analyze-injury', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to analyze image. Is the API running?');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="injury-scanner-wrapper">
      <div className="scanner-header">
        <h2>🔍 AI Injury Scanner</h2>
        <p>Upload a clear photo of your skin concern or injury for an instant AI assessment.</p>
      </div>

      {!preview ? (
        <div 
          className="upload-dropzone"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📸</div>
          <h3>Click or drag image here</h3>
          <p>Supports JPG, PNG (Max 5MB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
        </div>
      ) : (
        <div className="preview-container">
          <img src={preview} alt="Injury preview" className="image-preview" />
          
          {!result && !loading && (
            <div className="action-buttons">
              <button className="btn-secondary" onClick={resetScanner}>Change Image</button>
              <button className="btn-primary" onClick={analyzeImage}>Analyze Injury →</button>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="scanner-loading">
          <div className="spinner"></div>
          <p>Analyzing severity & symptoms...</p>
        </div>
      )}

      {error && (
        <div className="scanner-error">
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div className="scanner-results fade-in">
          <div className={`severity-banner severity-${result.severity.toLowerCase()}`}>
            <span className="severity-badge">{result.severity} SEVERITY</span>
            <h3>{result.top_prediction.replace(/_/g, ' ').toUpperCase()}</h3>
            <p className="confidence">AI Confidence: {result.confidence}%</p>
          </div>

          <div className="result-details">
            <div className="detail-card">
              <h4>🚑 First Aid Recommendation</h4>
              <p>{result.first_aid_tip}</p>
            </div>
            
            <div className="detail-card analysis-breakdown">
              <h4>📊 Analysis Breakdown</h4>
              <ul>
                {result.all_predictions.slice(0, 3).map((pred, idx) => (
                  <li key={idx}>
                    <span className="pred-name">{pred.injury.replace(/_/g, ' ')}</span>
                    <span className="pred-bar-wrap">
                      <span className="pred-bar" style={{ width: `${pred.confidence}%` }}></span>
                    </span>
                    <span className="pred-value">{pred.confidence}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="disclaimer-note">
            <p><strong>Disclaimer:</strong> {result.disclaimer}</p>
          </div>

          <button className="btn-outline-primary full-width mt-3" onClick={resetScanner}>
            Scan Another Image
          </button>
        </div>
      )}
    </div>
  );
}
