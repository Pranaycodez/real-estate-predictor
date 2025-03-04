import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import realEstateData from '../../data/real_estate_dataset.json';
import '../../styles/PricePrediction.css';
import ModelManager from './ModelManager';
import modelStorageService from '../../services/ModelStorageService';

const PricePrediction = () => {
  // Form Fields
  const [sqft, setSqft] = useState(2000);
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [age, setAge] = useState(5);
  
  // Training and Prediction States
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [trainedModel, setTrainedModel] = useState(null);
  const [savedModelData, setSavedModelData] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [trainingMetrics, setTrainingMetrics] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniquePropertyTypes, setUniquePropertyTypes] = useState([]);
  
  // Effect to extract unique locations and property types from the dataset
  useEffect(() => {
    const locations = [...new Set(realEstateData.map(item => item.location))];
    const propertyTypes = [...new Set(realEstateData.map(item => item.type))];
    
    setUniqueLocations(locations);
    setUniquePropertyTypes(propertyTypes);
    
    if (locations.length > 0) setLocation(locations[0]);
    if (propertyTypes.length > 0) setPropertyType(propertyTypes[0]);
    
    // Check for most recent saved model
    const loadMostRecentModel = async () => {
      try {
        const recentModel = await modelStorageService.getMostRecentModel();
        if (recentModel) {
          setSavedModelData(recentModel);
          setTrainedModel(recentModel.model);
          setTrainingMetrics({
            accuracy: recentModel.accuracy,
            rmse: recentModel.rmse,
            features: recentModel.features
          });
          setSuccess(`Loaded previously trained model "${recentModel.name}" with ${(recentModel.accuracy * 100).toFixed(1)}% accuracy`);
        }
      } catch (err) {
        console.error("Error loading recent model:", err);
      }
    };
    
    loadMostRecentModel();
  }, []);
  
  // Train model using linear regression
  const trainModel = () => {
    setIsTraining(true);
    setPrediction(null);
    setError(null);
    setSuccess(null);
    
    // Simulate training delay
    setTimeout(() => {
      try {
        // Extract features and target
        const X = realEstateData.map(item => [
          item.sqft, 
          item.bedrooms, 
          item.bathrooms, 
          uniqueLocations.indexOf(item.location),
          uniquePropertyTypes.indexOf(item.type),
          item.age
        ]);
        
        const y = realEstateData.map(item => item.price);
        
        // Simple linear regression implementation
        // Calculate coefficients using normal equation: θ = (X^T * X)^(-1) * X^T * y
        const X_t = transpose(X);
        const X_t_X = multiplyMatrices(X_t, X);
        const X_t_X_inv = invertMatrix(X_t_X);
        const X_t_y = multiplyMatrices(X_t, [y]);
        const theta = multiplyMatrices(X_t_X_inv, X_t_y).map(row => row[0]);
        
        // Calculate prediction accuracy metrics
        let sumErrorSquared = 0;
        let sumActualSquared = 0;
        
        for (let i = 0; i < X.length; i++) {
          const prediction = predict(X[i], theta);
          const error = prediction - y[i];
          sumErrorSquared += error * error;
          sumActualSquared += (y[i] - mean(y)) * (y[i] - mean(y));
        }
        
        const rmse = Math.sqrt(sumErrorSquared / X.length);
        const r2 = 1 - (sumErrorSquared / sumActualSquared);
        
        const modelObj = {
          coefficients: theta,
          intercept: theta[0]
        };
        
        // Update states with trained model and metrics
        setTrainedModel(modelObj);
        setTrainingMetrics({
          accuracy: r2,
          rmse: rmse,
          features: ['sqft', 'bedrooms', 'bathrooms', 'location', 'propertyType', 'age']
        });
        setSuccess("Model trained successfully! You can now make predictions.");
        
        // Save the trained model to IndexedDB
        saveModelToStorage(modelObj, r2, rmse);
        
      } catch (err) {
        console.error("Error training model:", err);
        setError("Error training model. Please try again.");
      } finally {
        setIsTraining(false);
      }
    }, 1500);
  };
  
  // Save model to IndexedDB
  const saveModelToStorage = async (model, accuracy, rmse) => {
    try {
      const metadata = {
        name: `Real Estate Model ${new Date().toLocaleDateString()}`,
        accuracy: accuracy,
        rmse: rmse,
        features: ['sqft', 'bedrooms', 'bathrooms', 'location', 'propertyType', 'age'],
        description: 'Linear regression model for real estate price prediction'
      };
      
      const savedModel = await modelStorageService.saveModel(model, metadata);
      setSavedModelData(savedModel);
      setSuccess(prevSuccess => `${prevSuccess} Model saved for future use.`);
    } catch (err) {
      console.error("Error saving model:", err);
      setError("The model was trained but could not be saved for future use.");
    }
  };
  
  // Handle model selection from ModelManager
  const handleModelSelected = (modelData) => {
    if (modelData) {
      setSavedModelData(modelData);
      setTrainedModel(modelData.model);
      setTrainingMetrics({
        accuracy: modelData.accuracy,
        rmse: modelData.rmse,
        features: modelData.features
      });
      setSuccess(`Loaded model "${modelData.name}" with ${(modelData.accuracy * 100).toFixed(1)}% accuracy`);
    } else {
      setSavedModelData(null);
      setTrainedModel(null);
      setTrainingMetrics(null);
    }
  };
  
  // Make a price prediction
  const makePrediction = () => {
    setIsPredicting(true);
    setPrediction(null);
    setError(null);
    
    setTimeout(() => {
      try {
        if (!trainedModel) {
          throw new Error("No trained model available");
        }
        
        // Prepare input features
        const input = [
          parseFloat(sqft),
          parseInt(bedrooms, 10),
          parseFloat(bathrooms),
          uniqueLocations.indexOf(location),
          uniquePropertyTypes.indexOf(propertyType),
          parseInt(age, 10)
        ];
        
        // Make prediction
        const predictedPrice = predict(input, trainedModel.coefficients);
        
        setPrediction({
          price: predictedPrice,
          timestamp: new Date()
        });
      } catch (err) {
        console.error("Error making prediction:", err);
        setError("Error making prediction. Please ensure you've trained a model.");
      } finally {
        setIsPredicting(false);
      }
    }, 800);
  };
  
  // Linear algebra helper functions
  const transpose = (matrix) => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(cols).fill().map(() => Array(rows).fill(0));
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    
    return result;
  };
  
  const multiplyMatrices = (a, b) => {
    const aRows = a.length;
    const aCols = a[0].length;
    const bRows = b.length;
    const bCols = b[0].length;
    
    if (aCols !== bRows) {
      throw new Error("Matrix dimensions do not match for multiplication");
    }
    
    const result = Array(aRows).fill().map(() => Array(bCols).fill(0));
    
    for (let i = 0; i < aRows; i++) {
      for (let j = 0; j < bCols; j++) {
        for (let k = 0; k < aCols; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    
    return result;
  };
  
  const invertMatrix = (matrix) => {
    // Simple matrix inversion for small matrices
    const n = matrix.length;
    
    if (n === 1) {
      return [[1 / matrix[0][0]]];
    }
    
    // For simplicity, use a direct formula for 2x2 matrices
    if (n === 2) {
      const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
      return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det]
      ];
    }
    
    // For larger matrices, use a library in a real application
    throw new Error("Matrix inversion not implemented for matrices larger than 2x2");
  };
  
  const mean = (array) => {
    return array.reduce((sum, val) => sum + val, 0) / array.length;
  };
  
  const predict = (features, coefficients) => {
    return features.reduce((sum, feature, index) => sum + feature * coefficients[index], 0);
  };
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Container className="price-prediction-container">
      <h2 className="mb-4 text-center">Real Estate Price Predictor</h2>
      
      {/* Model Management Section */}
      <ModelManager 
        onModelSelected={handleModelSelected} 
        selectedModelId={savedModelData?.id} 
      />
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}
      
      <Row>
        {/* Input Form */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Property Details</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Square Footage</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={sqft} 
                        onChange={(e) => setSqft(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bedrooms</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={bedrooms} 
                        onChange={(e) => setBedrooms(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bathrooms</Form.Label>
                      <Form.Control 
                        type="number" 
                        step="0.5"
                        value={bathrooms} 
                        onChange={(e) => setBathrooms(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Property Age (years)</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Select value={location} onChange={(e) => setLocation(e.target.value)}>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Property Type</Form.Label>
                  <Form.Select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    {uniquePropertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    onClick={makePrediction}
                    disabled={!trainedModel || isPredicting}
                  >
                    {isPredicting ? (
                      <>
                        <Spinner animation="border" size="sm" role="status" className="me-2" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calculator me-2"></i>
                        Get Price Estimate
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Model Training and Results Section */}
        <Col lg={6}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-secondary text-white">
              <h4 className="mb-0">Model Training</h4>
            </Card.Header>
            <Card.Body>
              {trainedModel ? (
                <div className="mb-3">
                  <Alert variant="success" className="d-flex align-items-center">
                    <i className="fas fa-check-circle fa-lg me-3"></i>
                    <div>
                      <strong>Model Ready</strong>
                      <div>The prediction model is trained and ready to use.</div>
                    </div>
                  </Alert>
                  {trainingMetrics && (
                    <div className="model-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Accuracy (R²):</span>
                        <span className="metric-value">
                          {(trainingMetrics.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">RMSE:</span>
                        <span className="metric-value">
                          {formatCurrency(trainingMetrics.rmse)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>No trained model available. Press the button below to train a new model using our dataset.</p>
              )}
              
              <div className="d-grid">
                <Button 
                  variant="secondary" 
                  onClick={trainModel} 
                  disabled={isTraining}
                  className="mt-3"
                >
                  {isTraining ? (
                    <>
                      <Spinner animation="border" size="sm" role="status" className="me-2" />
                      Training Model...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-brain me-2"></i>
                      Train New Model
                    </>
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Prediction Result */}
          {prediction && (
            <Card className="border-0 shadow-sm prediction-result">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0">Estimated Price</h4>
              </Card.Header>
              <Card.Body className="text-center">
                <div className="prediction-amount">
                  {formatCurrency(prediction.price)}
                </div>
                <p className="text-muted mt-3 mb-0">
                  <small>
                    <i className="fas fa-clock me-1"></i>
                    Generated on {prediction.timestamp.toLocaleString()}
                  </small>
                </p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-info text-white">
              <h4 className="mb-0">About the Model</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5>Features Used for Prediction</h5>
                  <ul className="feature-list">
                    <li><strong>Square Footage:</strong> Total area of the property</li>
                    <li><strong>Bedrooms:</strong> Number of bedrooms in the property</li>
                    <li><strong>Bathrooms:</strong> Number of bathrooms in the property</li>
                    <li><strong>Location:</strong> Geographic location of the property</li>
                    <li><strong>Property Type:</strong> Type of property (house, condo, etc.)</li>
                    <li><strong>Age:</strong> Age of the property in years</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h5>How It Works</h5>
                  <p>
                    This real estate price predictor uses linear regression to estimate property values based on historical 
                    data from our database. The model identifies patterns between property features and sale prices to make 
                    its predictions.
                  </p>
                  <p>
                    The model is trained using a database of {realEstateData.length} properties and their actual sale prices. 
                    Accuracy is measured using R² (how well the model explains price variations) and RMSE (average prediction error).
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PricePrediction;