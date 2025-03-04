import React, { useState } from 'react';
import { predictPrice } from '../../utils/neuralNetwork';
import '../../styles/PricePredictor.css';

const PricePredictor = () => {
  const [formData, setFormData] = useState({
    area: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    age: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.area) errors.area = 'Area is required';
    if (!formData.bedrooms) errors.bedrooms = 'Number of bedrooms is required';
    if (!formData.bathrooms) errors.bathrooms = 'Number of bathrooms is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.age) errors.age = 'Property age is required';

    // Validate numeric inputs
    if (formData.area && (isNaN(formData.area) || formData.area <= 0)) 
      errors.area = 'Area must be a positive number';
    if (formData.bedrooms && (isNaN(formData.bedrooms) || formData.bedrooms <= 0)) 
      errors.bedrooms = 'Bedrooms must be a positive number';
    if (formData.bathrooms && (isNaN(formData.bathrooms) || formData.bathrooms <= 0)) 
      errors.bathrooms = 'Bathrooms must be a positive number';
    if (formData.age && (isNaN(formData.age) || formData.age < 0)) 
      errors.age = 'Age cannot be negative';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (validateForm()) {
      setLoading(true);
      
      // Simulate a delay for better UX
      setTimeout(() => {
        const input = {
          area: parseFloat(formData.area),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseInt(formData.bathrooms),
          location: formData.location,
          age: parseInt(formData.age)
        };
        
        try {
          const result = predictPrice(input);
          setPrediction(result);
        } catch (error) {
          console.error('Prediction error:', error);
          setPrediction(null);
        } finally {
          setLoading(false);
        }
      }, 800);
    }
  };

  const resetForm = () => {
    setFormData({
      area: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      age: ''
    });
    setPrediction(null);
    setFormSubmitted(false);
  };

  return (
    <div className="predictor-container">
      <div className="predictor-header">
        <h2>Real Estate Price Predictor</h2>
        <p className="lead-text">
          Enter property details below to estimate the market value
        </p>
      </div>

      <div className="predictor-content">
        <div className="form-container">
          <form onSubmit={handleSubmit} className="predictor-form">
            <div className="form-group">
              <label htmlFor="area">Area (sq ft)</label>
              <input
                type="number"
                id="area"
                name="area"
                placeholder="e.g. 1500"
                value={formData.area}
                onChange={handleChange}
                className={formErrors.area && formSubmitted ? "error" : ""}
              />
              {formErrors.area && formSubmitted && <div className="error-message">{formErrors.area}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="bedrooms">Bedrooms</label>
                <select
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className={formErrors.bedrooms && formSubmitted ? "error" : ""}
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6+</option>
                </select>
                {formErrors.bedrooms && formSubmitted && <div className="error-message">{formErrors.bedrooms}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="bathrooms">Bathrooms</label>
                <select
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className={formErrors.bathrooms && formSubmitted ? "error" : ""}
                >
                  <option value="">Select</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
                {formErrors.bathrooms && formSubmitted && <div className="error-message">{formErrors.bathrooms}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={formErrors.location && formSubmitted ? "error" : ""}
              >
                <option value="">Select location</option>
                <option value="Downtown">Downtown</option>
                <option value="Suburban">Suburban</option>
                <option value="Rural">Rural</option>
              </select>
              {formErrors.location && formSubmitted && <div className="error-message">{formErrors.location}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age of Property (years)</label>
              <input
                type="number"
                id="age"
                name="age"
                placeholder="e.g. 10"
                value={formData.age}
                onChange={handleChange}
                className={formErrors.age && formSubmitted ? "error" : ""}
              />
              {formErrors.age && formSubmitted && <div className="error-message">{formErrors.age}</div>}
            </div>

            <div className="button-group">
              <button type="submit" className="submit-btn">
                {loading ? 'Calculating...' : 'Estimate Price'}
              </button>
              <button type="button" className="reset-btn" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="result-container">
          {loading ? (
            <div className="loading-results">
              <div className="pulse-loader"></div>
              <p>Processing your property data...</p>
            </div>
          ) : prediction !== null ? (
            <div className="results">
              <h3>Estimated Property Value</h3>
              <div className="price-display">
                <span className="dollar-sign">$</span>
                <span className="price-value">{(prediction * 1000).toLocaleString()}</span>
              </div>
              <div className="estimate-details">
                <p>Based on {formData.bedrooms} bed, {formData.bathrooms} bath</p>
                <p>{formData.area} sq ft in {formData.location} area</p>
                <p>Property age: {formData.age} years</p>
              </div>
              <div className="disclaimer">
                This is an AI-powered estimate based on our property database. 
                Market conditions and specific property features may affect actual value.
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🏠</div>
              <h3>Ready for your property estimate</h3>
              <p>Fill out the form with your property details to get a price estimate based on our machine learning model.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricePredictor;
