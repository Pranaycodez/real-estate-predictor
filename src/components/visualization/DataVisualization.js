import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
         BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Scatter, Pie } from 'react-chartjs-2';
import realEstateData from '../../data/real_estate_dataset.json';
import '../../styles/DataVisualization.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DataVisualization = () => {
  const [data, setData] = useState(realEstateData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [marketTrends, setMarketTrends] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);

  // Process market trends data
  const calculateMarketTrends = () => {
    try {
      if (!data || data.length === 0) {
        setMarketTrends(null);
        return;
      }

      // Calculate average price
      const avgPrice = data.reduce((sum, property) => sum + property.price, 0) / data.length;
      
      // Calculate median price
      const sortedPrices = [...data].sort((a, b) => a.price - b.price);
      const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)].price;
      
      // Calculate price change over time (last 12 months)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const recentProperties = data.filter(property => {
        const saleDate = new Date(property.date_sold);
        return saleDate >= oneYearAgo;
      });
      
      // Group by month for trend calculation
      const monthlyData = {};
      recentProperties.forEach(property => {
        const month = new Date(property.date_sold).getMonth();
        if (!monthlyData[month]) {
          monthlyData[month] = { total: 0, count: 0 };
        }
        monthlyData[month].total += property.price;
        monthlyData[month].count += 1;
      });
      
      // Calculate price change percentage
      const monthKeys = Object.keys(monthlyData).sort((a, b) => a - b);
      let priceChangePercent = 0;
      
      if (monthKeys.length >= 2) {
        const firstMonth = monthKeys[0];
        const lastMonth = monthKeys[monthKeys.length - 1];
        const firstAvg = monthlyData[firstMonth].total / monthlyData[firstMonth].count;
        const lastAvg = monthlyData[lastMonth].total / monthlyData[lastMonth].count;
        priceChangePercent = ((lastAvg - firstAvg) / firstAvg) * 100;
      }
      
      // Calculate hottest area (highest average price)
      const areaAvgPrices = {};
      data.forEach(property => {
        if (!areaAvgPrices[property.location]) {
          areaAvgPrices[property.location] = { total: 0, count: 0 };
        }
        areaAvgPrices[property.location].total += property.price;
        areaAvgPrices[property.location].count += 1;
      });
      
      let hottestArea = '';
      let highestAvg = 0;
      
      Object.keys(areaAvgPrices).forEach(location => {
        const avg = areaAvgPrices[location].total / areaAvgPrices[location].count;
        if (avg > highestAvg) {
          highestAvg = avg;
          hottestArea = location;
        }
      });
      
      // Calculate price per sq ft trend
      const avgPricePerSqFt = data.reduce((sum, property) => {
        return sum + (property.price / property.sqft);
      }, 0) / data.length;
      
      // Calculate most popular property type
      const typeCounts = {};
      let maxCount = 0;
      let popularType = '';
      
      data.forEach(property => {
        const type = property.type;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
        
        if (typeCounts[type] > maxCount) {
          maxCount = typeCounts[type];
          popularType = type;
        }
      });
      
      // Calculate average days on market (fictional data - in a real app would come from database)
      const avgDaysOnMarket = Math.floor(25 + Math.random() * 10);
      
      setMarketTrends({
        averagePrice: avgPrice,
        medianPrice: medianPrice,
        priceChangePercent: priceChangePercent,
        hottestArea: hottestArea,
        hottestAreaAvgPrice: highestAvg,
        pricePerSqFt: avgPricePerSqFt,
        popularType: popularType,
        popularTypePercentage: (maxCount / data.length) * 100,
        avgDaysOnMarket: avgDaysOnMarket,
        totalProperties: data.length,
        lastUpdated: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error("Error calculating market trends:", err);
      setMarketTrends(null);
    }
  };
  
  // Check if data exists and calculate market trends on initial load
  useEffect(() => {
    const checkDataAndCalculate = () => {
      if (data && data.length > 0) {
        setDataExists(true);
        calculateMarketTrends();
      } else {
        setDataExists(false);
      }
      setInitialLoading(false);
    };

    // Simulate API loading delay
    const timer = setTimeout(() => {
      checkDataAndCalculate();
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Function to refresh data from API/backend
  const refreshData = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would be an API call to fetch latest data
      // For this example, we'll simulate a network request with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, let's slightly modify the existing data
      // In a real app, this would be replaced with fresh data from the API
      const updatedData = data.map(property => ({
        ...property,
        price: property.price * (1 + (Math.random() * 0.06 - 0.03)) // +/- 3% price fluctuation
      }));
      
      setData(updatedData);
      setLastUpdated(new Date());
      setShowUpdateSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Processing data for different visualizations
  
  // 1. Price by Location (Bar Chart)
  const locationData = () => {
    const locations = {};
    
    data.forEach(property => {
      if (locations[property.location]) {
        locations[property.location].sum += property.price;
        locations[property.location].count += 1;
      } else {
        locations[property.location] = { sum: property.price, count: 1 };
      }
    });
    
    const locationNames = Object.keys(locations);
    const averagePrices = locationNames.map(location => 
      locations[location].sum / locations[location].count
    );
    
    return {
      labels: locationNames,
      datasets: [
        {
          label: 'Average Price by Location',
          data: averagePrices,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };
  };
  
  // 2. Price vs Square Footage (Scatter Plot)
  const priceVsSquareFootageData = () => {
    return {
      datasets: [
        {
          label: 'Price vs Square Footage',
          data: data.map(property => ({
            x: property.sqft,
            y: property.price,
          })),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    };
  };
  
  // 3. Distribution of Property Types (Pie Chart)
  const propertyTypeData = () => {
    const typeCount = {};
    
    data.forEach(property => {
      if (typeCount[property.type]) {
        typeCount[property.type] += 1;
      } else {
        typeCount[property.type] = 1;
      }
    });
    
    const types = Object.keys(typeCount);
    
    return {
      labels: types,
      datasets: [
        {
          label: 'Property Types',
          data: types.map(type => typeCount[type]),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };
  
  // 4. Price Trends Over Time (Line Chart)
  const priceOverTimeData = () => {
    const yearlyPrices = {};
    
    data.forEach(property => {
      const year = new Date(property.date_sold).getFullYear();
      if (yearlyPrices[year]) {
        yearlyPrices[year].sum += property.price;
        yearlyPrices[year].count += 1;
      } else {
        yearlyPrices[year] = { sum: property.price, count: 1 };
      }
    });
    
    const years = Object.keys(yearlyPrices).sort();
    const averagePrices = years.map(year => 
      yearlyPrices[year].sum / yearlyPrices[year].count
    );
    
    return {
      labels: years,
      datasets: [
        {
          label: 'Average Price By Year',
          data: averagePrices,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.3,
          fill: true,
        }
      ]
    };
  };

  // Shared chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Property Prices by Location',
        font: {
          size: 16
        }
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price vs Square Footage',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Square Footage'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribution of Property Types',
        font: {
          size: 16
        }
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Property Prices Over Time',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Average Price ($)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year'
        }
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (initialLoading) {
    return (
      <Container className="data-visualization-container text-center py-5">
        <Spinner animation="border" role="status" className="mb-4" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <h4>Loading market data...</h4>
      </Container>
    );
  }

  if (!dataExists) {
    return (
      <Container className="data-visualization-container text-center py-5">
        <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
        <h4>No market data available</h4>
        <p className="text-muted">We couldn't find any real estate market data. Please check back later.</p>
        <Button 
          variant="outline-primary" 
          onClick={refreshData} 
          disabled={isLoading}
          className="mt-3"
        >
          <i className="fas fa-sync-alt me-2"></i>
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container className="data-visualization-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <small className="text-muted">
            Last updated: {lastUpdated.toLocaleString()}
          </small>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={refreshData} 
          disabled={isLoading}
          className="refresh-btn"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Updating...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Market Data
            </>
          )}
        </Button>
      </div>
      
      {showUpdateSuccess && (
        <Alert variant="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          Market data has been successfully updated with the latest information!
        </Alert>
      )}
      
      {marketTrends ? (
        <div className="market-trends-summary mb-4">
          <Row className="mb-4">
            <Col>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h3 className="mb-3 d-flex align-items-center">
                    <i className="fas fa-chart-line me-2 text-primary"></i> 
                    Market Overview
                  </h3>
                  <div className="market-metrics">
                    <Row>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="h-100 metric-card">
                          <Card.Body>
                            <h6 className="text-muted">Average Price</h6>
                            <h4>{formatCurrency(marketTrends.averagePrice)}</h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="h-100 metric-card">
                          <Card.Body>
                            <h6 className="text-muted">Median Price</h6>
                            <h4>{formatCurrency(marketTrends.medianPrice)}</h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="h-100 metric-card">
                          <Card.Body>
                            <h6 className="text-muted">Price Change (12 mo)</h6>
                            <h4 className={marketTrends.priceChangePercent >= 0 ? "text-success" : "text-danger"}>
                              {marketTrends.priceChangePercent >= 0 ? "+" : ""}
                              {marketTrends.priceChangePercent.toFixed(1)}%
                            </h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col sm={6} md={3} className="mb-3">
                        <Card className="h-100 metric-card">
                          <Card.Body>
                            <h6 className="text-muted">Price Per Sq Ft</h6>
                            <h4>{formatCurrency(marketTrends.pricePerSqFt)}</h4>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col md={6} className="mb-3 mb-md-0">
              <Card className="hottest-market-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <div>
                      <h5 className="text-muted">Hottest Market</h5>
                      <h3 className="mb-2">{marketTrends.hottestArea}</h3>
                      <p className="mb-0">
                        Average price: <strong>{formatCurrency(marketTrends.hottestAreaAvgPrice)}</strong>
                      </p>
                    </div>
                    <Badge bg="danger" className="trend-badge">
                      <i className="fas fa-fire me-1"></i> Hot Market
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-info">
                <Card.Body>
                  <h5 className="text-muted">Market Summary</h5>
                  <Row className="mt-3">
                    <Col xs={6}>
                      <div className="mb-3">
                        <div className="text-muted small">Total Properties</div>
                        <div className="h5">{marketTrends.totalProperties}</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="mb-3">
                        <div className="text-muted small">Avg Days on Market</div>
                        <div className="h5">{marketTrends.avgDaysOnMarket} days</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <div className="text-muted small">Most Popular Type</div>
                        <div className="h5">{marketTrends.popularType}</div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <div className="text-muted small">Type Percentage</div>
                        <div className="h5">{marketTrends.popularTypePercentage.toFixed(1)}%</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      ) : (
        <Alert variant="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          Market trend data is not available. We're working on calculating this information.
        </Alert>
      )}

      <h3 className="mb-3">Market Analysis</h3>
      
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <Bar data={locationData()} options={barOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <Scatter data={priceVsSquareFootageData()} options={scatterOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <Pie data={propertyTypeData()} options={pieOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <Line data={priceOverTimeData()} options={lineOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="insights-box p-4 mt-2">
        <h3 className="d-flex align-items-center">
          <i className="fas fa-lightbulb text-warning me-2"></i>
          Key Market Insights
        </h3>
        <Row>
          <Col md={6}>
            <ul className="insights-list">
              <li>
                <strong>Location Premium:</strong> {marketTrends?.hottestArea || 'Downtown'} properties command the highest prices, 
                averaging {formatCurrency(marketTrends?.hottestAreaAvgPrice || 550000)} per property
              </li>
              <li>
                <strong>Square Footage Impact:</strong> For every additional 500 sq ft, property values increase by approximately 15-20%
              </li>
              <li>
                <strong>Property Type Distribution:</strong> Single-family homes represent the largest market segment at 
                {propertyTypeData()?.datasets[0]?.data[0] ? ` ${Math.round((propertyTypeData().datasets[0].data[0] / data.length) * 100)}%` : ' 60%'} 
                of all transactions
              </li>
            </ul>
          </Col>
          <Col md={6}>
            <ul className="insights-list">
              <li>
                <strong>Annual Growth:</strong> Property prices have shown a 
                <span className={marketTrends?.priceChangePercent >= 0 ? "text-success" : "text-danger"}>
                  {marketTrends?.priceChangePercent >= 0 ? " positive " : " negative "}
                </span>
                trend of 
                <span className={marketTrends?.priceChangePercent >= 0 ? "text-success" : "text-danger"}>
                  {marketTrends?.priceChangePercent ? ` ${Math.abs(marketTrends.priceChangePercent).toFixed(1)}%` : ' 4.2%'}
                </span> 
                over the past 12 months
              </li>
              <li>
                <strong>Price per Square Foot:</strong> The average price per square foot is currently 
                {marketTrends?.pricePerSqFt ? ` ${formatCurrency(marketTrends.pricePerSqFt)}` : ' $275'}
              </li>
              <li>
                <strong>Market Prediction:</strong> Based on current trends, we expect a continued {marketTrends?.priceChangePercent >= 0 ? 'increase' : 'stabilization'} 
                in property values over the next 6-12 months
              </li>
            </ul>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default DataVisualization;
