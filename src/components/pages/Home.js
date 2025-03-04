import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import PropertyForm from '../prediction/PropertyForm';
import PredictionResult from '../prediction/PredictionResult';
import DataVisualization from '../visualization/DataVisualization';
import { trainNeuralNetwork } from '../../utils/neuralNetwork';
import '../../styles/Home.css';

const Home = () => {
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [updateCounter, setUpdateCounter] = useState(0);  // Add a counter to force re-renders

  useEffect(() => {
    // Train the neural network when the component mounts
    const initializeModel = async () => {
      try {
        await trainNeuralNetwork();
        setIsModelReady(true);
      } catch (error) {
        console.error('Error initializing neural network:', error);
      }
    };

    initializeModel();
  }, []);

  // Use useCallback to ensure this function doesn't change on every render
  const handlePredict = useCallback((price, details) => {
    console.log("Prediction received in Home component:", price);
    console.log("Property details:", details);
    
    // Force a re-render by incrementing counter in addition to setting values
    setPredictedPrice(price);
    setPropertyDetails(details);
    setUpdateCounter(prev => prev + 1);
  }, []);

  return (
    <div className="home-container">
      <div className="jumbotron text-center mb-5">
        <h1>Real Estate Price Predictor</h1>
        <p className="lead">
          Explore property market trends and get instant price predictions using our advanced neural network model
        </p>
      </div>

      {/* Price Predictor Section - Now first */}
      <section className="predictor-section mb-5">
        <h2 className="text-center mb-4">Get Your Property Price Prediction</h2>
        
        {!isModelReady ? (
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Initializing prediction model...</p>
          </div>
        ) : (
          <Container>
            <Row>
              <Col lg={6} className="mb-4">
                <PropertyForm onPredict={handlePredict} />
              </Col>
              
              <Col lg={6}>
                <PredictionResult 
                  key={updateCounter}  // Force re-render when counter changes
                  predictedPrice={predictedPrice} 
                  propertyDetails={propertyDetails}
                  loadingState={predictedPrice === null}
                />
              </Col>
            </Row>
          </Container>
        )}
      </section>

      {/* Data Visualization Section - Now second */}
      <section className="data-viz-section">
        <h2 className="text-center mb-4">Real Estate Market Insights</h2>
        <DataVisualization />
      </section>
    </div>
  );
};

export default Home;
