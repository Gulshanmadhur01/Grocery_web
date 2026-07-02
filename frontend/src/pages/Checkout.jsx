import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Truck } from 'lucide-react';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, cartSubtotal, checkoutAddress, setCheckoutAddress, deliveryLocation } = useContext(AppContext);
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});

  // Auto-fill delivery address from detected location if not already filled
  useEffect(() => {
    if (deliveryLocation && !checkoutAddress.streetAddress) {
      const parts = deliveryLocation.split(' - ');
      const street = parts[0] || '';
      const zip = parts[1] || '';
      const cityMatch = street.match(/,\s*([^,]+)$/);
      const city = cityMatch ? cityMatch[1] : '';

      setCheckoutAddress(prev => ({
        ...prev,
        streetAddress: street,
        city: city || 'New Delhi',
        zipCode: zip
      }));
    }
  }, [deliveryLocation, checkoutAddress, setCheckoutAddress]);

  const deliveryFee = cartSubtotal > 1000 ? 0 : 99;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutAddress(prev => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    const errors = {};
    if (!checkoutAddress.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!checkoutAddress.phone.trim()) errors.phone = 'Phone number is required';
    if (!checkoutAddress.streetAddress.trim()) errors.streetAddress = 'Delivery address is required';
    if (!checkoutAddress.city.trim()) errors.city = 'City is required';
    if (!checkoutAddress.zipCode.trim()) errors.zipCode = 'ZIP Code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      navigate('/payment');
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`${styles.empty} container`}>
        <h2>No items in checkout</h2>
        <p>Please add grocery products to your cart before proceeding to checkout.</p>
        <Link to="/categories" className="btn btn-primary">Go to Categories</Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <Link to="/cart" className={styles.backBtn}><ArrowLeft size={16} /> Back to Cart</Link>
      </div>

      {/* Progressive Step Progress Tracker */}
      <div className={styles.progressTracker}>
        <div className={`${styles.stepIndicator} ${styles.stepActive}`}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Shipping Address</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={styles.stepIndicator}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Payment Method</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.layout}>
        {/* Left Column: Shipping Address Form */}
        <div className={styles.formColumn}>
          <div className={`${styles.sectionCard} card`}>
            <h2 className={styles.sectionTitle}><Truck size={20} /> Shipping Details</h2>
            <hr className={styles.divider} />
            
            <div className="form-group">
              <label className="form-label">Receiver's Full Name</label>
              <input 
                type="text" 
                name="fullName"
                value={checkoutAddress.fullName} 
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Rahul Sharma"
              />
              {formErrors.fullName && <span className={styles.errMessage}>{formErrors.fullName}</span>}
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  value={checkoutAddress.phone} 
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. +91 98765 43210"
                />
                {formErrors.phone && <span className={styles.errMessage}>{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input 
                  type="text" 
                  name="zipCode"
                  value={checkoutAddress.zipCode} 
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="e.g. 110001"
                />
                {formErrors.zipCode && <span className={styles.errMessage}>{formErrors.zipCode}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Street Address</label>
              <input 
                type="text" 
                name="streetAddress"
                value={checkoutAddress.streetAddress} 
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. H-Block, Sector 62, Landmark"
              />
              {formErrors.streetAddress && <span className={styles.errMessage}>{formErrors.streetAddress}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text" 
                name="city"
                value={checkoutAddress.city} 
                onChange={handleInputChange}
                className="form-control"
                placeholder="e.g. Noida / New Delhi"
              />
              {formErrors.city && <span className={styles.errMessage}>{formErrors.city}</span>}
            </div>
          </div>
        </div>

        {/* Right Column: Invoice Summary Card */}
        <div className={styles.summaryColumn}>
          <div className={`${styles.summaryCard} card`}>
            <h3 className={styles.summaryTitle}>Your Items</h3>
            <hr className={styles.divider} />
            
            <div className={styles.itemList}>
              {cart.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <span>{item.name} <small>({item.unit})</small> <strong>x{item.quantity}</strong></span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className={styles.divider} />

            <div className={styles.summaryDetailRow}>
              <span>Subtotal</span>
              <span>₹{cartSubtotal.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryDetailRow}>
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
            </div>

            <hr className={styles.divider} />

            <div className={`${styles.summaryDetailRow} ${styles.grandTotalRow}`}>
              <span>Total Price</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary ${styles.orderBtn}`}
            >
              Proceed to Payment
            </button>
          </div>
        </div>

        {/* Sticky Mobile Bottom Bar */}
        <div className={styles.mobileBottomBar}>
          <div className={styles.mobileBottomInfo}>
            <span className={styles.mobileBottomLabel}>Total Price</span>
            <span className={styles.mobileBottomPrice}>₹{grandTotal.toFixed(2)}</span>
          </div>
          <button 
            type="submit" 
            className={`btn btn-primary ${styles.mobileBottomBtn}`}
          >
            Proceed to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
