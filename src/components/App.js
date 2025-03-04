import React from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Home from './pages/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/App.css';

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Header />
      <main className="container flex-grow-1 mt-4">
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default App;
