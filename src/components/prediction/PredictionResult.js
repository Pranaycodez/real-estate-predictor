import React, { useState, useEffect } from 'react';
import '../../styles/PredictionResult.css';

const PredictionResult = ({ predictedPrice, propertyDetails, loadingState }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(null);
  const [displayDetails, setDisplayDetails] = useState(null);
  
  // Update the display values when props change
  useEffect(() => {
    if (predictedPrice !== null && propertyDetails) {
      console.log("PredictionResult received new price:", predictedPrice);
      setIsUpdating(true);
      
      // Update the displayed values
      setDisplayPrice(predictedPrice);
      setDisplayDetails(propertyDetails);
      
      const timer = setTimeout(() => {
        setIsUpdating(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [predictedPrice, propertyDetails]);

  // If we have a price prediction, show it with property details
  if (displayPrice !== null && displayDetails) {
    return (
      <div className="prediction-result">
        <h3 className="result-title">Estimated Property Value</h3>
        
        <div className="price-display">
          <span className="dollar-sign">$</span>
          <span className={`price-value ${isUpdating ? 'updating' : ''}`}>
            {(displayPrice * 1000).toLocaleString()}
          </span>
        </div>
        
        <div className={`property-summary ${isUpdating ? 'updating' : ''}`}>
          <div className="detail-item">
            <span className="detail-icon">📐</span>
            <span>{displayDetails.area.toLocaleString()} sq ft</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🛏️</span>
            <span>{displayDetails.bedrooms} {displayDetails.bedrooms > 1 ? 'bedrooms' : 'bedroom'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🚿</span>
            <span>{displayDetails.bathrooms} {displayDetails.bathrooms > 1 ? 'bathrooms' : 'bathroom'}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span>{displayDetails.location}</span>
          </div>
          
          <div className="detail-item">
            <span className="detail-icon">🗓️</span>
            <span>{displayDetails.age} {displayDetails.age === 1 ? 'year' : 'years'} old</span>
          </div>
        </div>
        
        <div className="confidence-meter">
          <div className="confidence-label">
            <span>Confidence Level</span>
            <span>High</span>
          </div>
          <div className="confidence-bar">
            <div className="confidence-level" style={{width: '85%'}}></div>
          </div>
          <p className="confidence-note">
            This estimate is based on our neural network model trained on recent market data.
            Change any property details to see how it affects the value.
          </p>
        </div>
      </div>
    );
  } 
  
  // Show a helpful waiting state when no prediction has been made yet
  return (
    <div className="prediction-waiting">
      <div className="prediction-icon">💰</div>
      <h3>Ready for Your Property Estimate</h3>
      <p>Enter property details on the left to get your estimate.</p>
      <div className="prediction-features">
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <div className="feature-text">Real-time updates</div>
        </div>
        <div className="feature">
          <div className="feature-icon">🧠</div>
          <div className="feature-text">AI-powered prediction</div>
        </div>
        <div className="feature">
          <div className="feature-icon">📊</div>
          <div className="feature-text">Based on market data</div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
