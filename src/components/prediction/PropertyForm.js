import React, { useState, useEffect, useCallback } from 'react';
import { predictPrice } from '../../utils/neuralNetwork';
import '../../styles/PropertyForm.css';

const PropertyForm = ({ onPredict }) => {
  // Default values to make the form more user-friendly
  const [formData, setFormData] = useState({
    area: '1500',
    bedrooms: '3',
    bathrooms: '2',
    location: 'Suburban',
    age: '5'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Removed unused initialRenderRef

  // Define validateFormData with useCallback
  const validateFormData = useCallback((data) => {
    const newErrors = {};
    
    if (!data.area || isNaN(data.area) || Number(data.area) <= 0) {
      newErrors.area = 'Please enter a valid area (greater than 0)';
    }
    
    if (!data.bedrooms || isNaN(data.bedrooms) || Number(data.bedrooms) <= 0) {
      newErrors.bedrooms = 'Please select the number of bedrooms';
    }
    
    if (!data.bathrooms || isNaN(data.bathrooms) || Number(data.bathrooms) <= 0) {
      newErrors.bathrooms = 'Please select the number of bathrooms';
    }
    
    if (!data.location) {
      newErrors.location = 'Please select a location';
    }
    
    if (!data.age || isNaN(data.age) || Number(data.age) < 0) {
      newErrors.age = 'Please enter a valid property age (0 or greater)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Define makePrediction with useCallback to prevent unnecessary recreations
  const makePrediction = useCallback((data) => {
    setLoading(true);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      try {
        // Convert form values to appropriate types
        const input = {
          area: parseFloat(data.area),
          bedrooms: parseInt(data.bedrooms),
          bathrooms: parseInt(data.bathrooms),
          location: data.location,
          age: parseInt(data.age)
        };
        
        // Make prediction
        const price = predictPrice(input);
        
        // Log to check if prediction is calculated
        console.log("Making prediction with:", input);
        console.log("Calculated price:", price);
        
        // Pass the prediction and property details to parent
        onPredict(price, {
          area: input.area,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          location: input.location,
          age: input.age
        });
      } catch (error) {
        console.error("Error making prediction:", error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [onPredict]);

  // Initial prediction on component mount
  useEffect(() => {
    console.log("Initial prediction with default values");
    makePrediction(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // We've removed the commented-out useEffect that used initialRenderRef

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data immediately
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    
    if (validateFormData(formData)) {
      console.log("Form is valid, making prediction...");
      makePrediction(formData);
    } else {
      console.log("Form has validation errors:", errors);
    }
  };

  return (
    <div className="property-form-container">
      <h3 className="form-title">Property Details</h3>
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="area">Area (sq ft)</label>
          <input
            type="number"
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={errors.area ? 'form-control is-invalid' : 'form-control'}
            placeholder="Enter area in square feet"
          />
          {errors.area && <div className="invalid-feedback">{errors.area}</div>}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bedrooms">Bedrooms</label>
            <select
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              className={errors.bedrooms ? 'form-control is-invalid' : 'form-control'}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
            {errors.bedrooms && <div className="invalid-feedback">{errors.bedrooms}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="bathrooms">Bathrooms</label>
            <select
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              className={errors.bathrooms ? 'form-control is-invalid' : 'form-control'}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5+</option>
            </select>
            {errors.bathrooms && <div className="invalid-feedback">{errors.bathrooms}</div>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'form-control is-invalid' : 'form-control'}
          >
            <option value="Downtown">Downtown</option>
            <option value="Suburban">Suburban</option>
            <option value="Rural">Rural</option>
          </select>
          {errors.location && <div className="invalid-feedback">{errors.location}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Property Age (years)</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'form-control is-invalid' : 'form-control'}
            placeholder="Enter property age in years"
          />
          {errors.age && <div className="invalid-feedback">{errors.age}</div>}
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-block btn-predict"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Update Estimate'}
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;
