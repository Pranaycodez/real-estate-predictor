import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';

// Use HashRouter for GitHub Pages to handle routing properly
// Change to BrowserRouter if not using GitHub Pages
const Router = process.env.NODE_ENV === 'production' ? HashRouter : BrowserRouter;
const basename = process.env.NODE_ENV === 'production' ? '/Real-estate-predictor' : '';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router basename={basename}>
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();
