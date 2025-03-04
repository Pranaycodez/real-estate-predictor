import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Navbar, Nav } from 'react-bootstrap';
import PropertyValueEstimator from './components/PropertyValueEstimator';

function App() {
  return (
    <div className="App">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Real Estate Predictor</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Home</Nav.Link>
              <Nav.Link href="#estimator">Estimator</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <main>
        <Container>
          <PropertyValueEstimator />
        </Container>
      </main>
      
      <footer className="bg-dark text-light py-3 mt-5">
        <Container className="text-center">
          <p>&copy; {new Date().getFullYear()} Real Estate Predictor</p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
