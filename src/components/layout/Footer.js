import React from 'react';
import { Container } from 'react-bootstrap';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-3 mt-auto">
      <Container className="text-center">
        <p className="mb-0">&copy; {new Date().getFullYear()} Real Estate Predictor | Built with React & Brain.js</p>
      </Container>
    </footer>
  );
};

export default Footer;
