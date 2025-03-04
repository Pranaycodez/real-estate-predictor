import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import '../styles/PropertyValueEstimator.css';
import { safeParseNumber, formatCurrency } from '../utils/numberUtils';

const PropertyValueEstimator = () => {
  const [formData, setFormData] = useState({
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    yearBuilt: '',
  });
  const [estimatedValue, setEstimatedValue] = useState(null);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateInputs = () => {
    // Reset previous errors
    setError('');
    
    // Check if all fields are filled
    for (const key in formData) {
      if (!formData[key]) {
        setError(`Please fill in all fields (${key} is missing)`);
        return false;
      }
    }

    // Check if numeric fields contain valid numbers
    const numericFields = ['squareFootage', 'bedrooms', 'bathrooms', 'yearBuilt'];
    for (const field of numericFields) {
      // Use our safeParseNumber utility
      const value = safeParseNumber(formData[field]);
      
      if (value === 0) {
        setError(`Please enter a valid number for ${field}`);
        return false;
      }
      
      // Additional validation for positive values
      if (value <= 0 && field !== 'yearBuilt') {
        setError(`${field} must be greater than zero`);
        return false;
      }
    }

    // Validate year built
    const yearBuilt = parseInt(formData.yearBuilt, 10);
    const currentYear = new Date().getFullYear();
    if (yearBuilt < 1800 || yearBuilt > currentYear) {
      setError(`Year built should be between 1800 and ${currentYear}`);
      return false;
    }

    return true;
  };

  const calculatePropertyValue = () => {
    if (!validateInputs()) return;

    try {
      // Convert inputs to numeric values using our utility function
      const squareFootage = safeParseNumber(formData.squareFootage);
      const bedrooms = safeParseNumber(formData.bedrooms);
      const bathrooms = safeParseNumber(formData.bathrooms);
      const yearBuilt = safeParseNumber(formData.yearBuilt);
      
      // Save debug info for troubleshooting
      const debugData = {
        squareFootage,
        bedrooms,
        bathrooms,
        yearBuilt,
        location: formData.location
      };
      
      console.log("Input values after conversion:", debugData);
      setDebugInfo(debugData);
      
      // Double-check for zero or negative values that might cause problems
      if (squareFootage <= 0) {
        setError("Square footage must be greater than zero");
        return;
      }

      if (bedrooms < 0) {
        setError("Bedrooms cannot be negative");
        return;
      }

      if (bathrooms < 0) {
        setError("Bathrooms cannot be negative");
        return;
      }

      if (yearBuilt <= 0) {
        setError("Year built must be greater than zero");
        return;
      }
      
      // Sample calculation logic - simplified for clarity
      const basePrice = 100000; // Base price for any property
      const sqftValue = squareFootage * 150; // $150 per square foot
      const bedroomValue = bedrooms * 15000; // $15,000 per bedroom
      const bathroomValue = bathrooms * 10000; // $10,000 per bathroom
      const ageValue = (new Date().getFullYear() - yearBuilt) * -1000; // Depreciation by age
      
      // Location factor
      let locationFactor = 1.0;
      if (formData.location) {
        switch(formData.location.toLowerCase()) {
          case 'urban':
            locationFactor = 1.3;
            break;
          case 'suburban':
            locationFactor = 1.1;
            break;
          case 'rural':
            locationFactor = 0.9;
            break;
          default:
            locationFactor = 1.0;
        }
      }
      
      // Calculate with intermediate step logging for debugging
      const baseWithFeatures = basePrice + sqftValue + bedroomValue + bathroomValue + ageValue;
      
      console.log("Calculation steps:", {
        basePrice,
        sqftValue,
        bedroomValue,
        bathroomValue,
        ageValue,
        locationFactor,
        baseWithFeatures
      });
      
      // Final calculation
      let calculatedValue = baseWithFeatures * locationFactor;
      
      // Ensure we never get a negative value
      calculatedValue = Math.max(calculatedValue, 0);
      
      console.log("Final calculated value:", calculatedValue);
      
      // Set the result, ensuring it's a valid number
      setEstimatedValue(calculatedValue);
    } catch (err) {
      console.error("Error in calculation:", err);
      setError("An unexpected error occurred during calculation.");
      setEstimatedValue(0);
    }
  };

  // Safe formatting for displaying the value
  const getDisplayValue = () => {
    if (estimatedValue === null) return null;
    
    // Use the formatCurrency utility or handle directly
    return formatCurrency(estimatedValue);
  };

  return (
    <div className="property-estimator-container">
      <Card className="estimator-card">
        <Card.Header as="h4">Property Value Estimator</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Square Footage</Form.Label>
              <Form.Control
                type="number"
                name="squareFootage"
                value={formData.squareFootage}
                onChange={handleChange}
                placeholder="Enter square footage"
                min="1"
                step="1"
              />
              <Form.Text className="text-muted">
                Enter a positive number
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Number of Bedrooms</Form.Label>
              <Form.Control
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                placeholder="Enter number of bedrooms"
                min="0"
                step="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Number of Bathrooms</Form.Label>
              <Form.Control
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                placeholder="Enter number of bathrooms"
                min="0"
                step="0.5"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Select 
                name="location" 
                value={formData.location}
                onChange={handleChange}
              >
                <option value="">Select location type</option>
                <option value="urban">Urban</option>
                <option value="suburban">Suburban</option>
                <option value="rural">Rural</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Year Built</Form.Label>
              <Form.Control
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleChange}
                placeholder="Enter year built"
                min="1800"
                max={new Date().getFullYear()}
                step="1"
              />
              <Form.Text className="text-muted">
                Year must be between 1800 and {new Date().getFullYear()}
              </Form.Text>
            </Form.Group>

            <Button 
              variant="primary" 
              onClick={calculatePropertyValue}
              className="mt-2"
            >
              Estimate Property Value
            </Button>
          </Form>
          
          {estimatedValue !== null && (
            <div className="estimated-value-container mt-4">
              <h5>Estimated Property Value:</h5>
              <h3>{getDisplayValue()}</h3>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && Object.keys(debugInfo).length > 0 && (
            <div className="debug-info mt-4 p-3 border border-secondary rounded">
              <h6>Debug Information:</h6>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              <div>
                <strong>Raw estimated value:</strong> {estimatedValue}
              </div>
              <div>
                <strong>Formatted value:</strong> {getDisplayValue()}
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PropertyValueEstimator;
