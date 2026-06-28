import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LocationModal from './components/LocationModal';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Categories from './pages/Categories';
import Offers from './pages/Offers';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <LocationModal />
        <CartDrawer />
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;

