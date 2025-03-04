import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import '../../styles/Header.css';

const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="header-navbar">
      <Container>
        <Navbar.Brand href="/">
          <i className="fas fa-home me-2"></i>
          Real Estate Predictor
        </Navbar.Brand>
        <div className="navbar-text text-light d-none d-md-block">
          AI-powered property price estimation
        </div>
      </Container>
    </Navbar>
  );
};

export default Header;
