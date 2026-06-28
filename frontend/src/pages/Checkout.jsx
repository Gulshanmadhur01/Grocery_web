import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, CheckCircle, Package, Calendar, Phone, MapPin, Truck, Landmark, CreditCard, Smartphone, Coins } from 'lucide-react';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, cartSubtotal, placeOrder, deliveryLocation } = useContext(AppContext);
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    zipCode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod'
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState(1); // Step 1: Shipping, Step 2: Payment

  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  // Auto-fill delivery address from detected location (Blinkit style)
  useEffect(() => {
    if (deliveryLocation && !address.streetAddress) {
      const parts = deliveryLocation.split(' - ');
      const street = parts[0] || '';
      const zip = parts[1] || '';
      const cityMatch = street.match(/,\s*([^,]+)$/);
      const city = cityMatch ? cityMatch[1] : '';

      setAddress(prev => ({
        ...prev,
        streetAddress: street,
        city: city || 'New Delhi',
        zipCode: zip
      }));
    }
  }, [deliveryLocation]);

  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const deliveryFee = cartSubtotal > 1000 ? 0 : 99;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === 'address') {
      setAddress(prev => ({ ...prev, [name]: value }));
    } else {
      setCard(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateShipping = () => {
    const errors = {};
    if (!address.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!address.phone.trim()) errors.phone = 'Phone number is required';
    if (!address.streetAddress.trim()) errors.streetAddress = 'Delivery address is required';
    if (!address.city.trim()) errors.city = 'City is required';
    if (!address.zipCode.trim()) errors.zipCode = 'ZIP Code is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors = {};
    if (paymentMethod === 'card') {
      if (!card.number.trim() || card.number.replace(/\s/g, '').length < 16) {
        errors.cardNumber = 'Invalid Card Number (16 digits required)';
      }
      if (!card.expiry.trim() || !card.expiry.includes('/')) {
        errors.cardExpiry = 'Expiry date required (MM/YY)';
      }
      if (!card.cvv.trim() || card.cvv.length < 3) {
        errors.cardCvv = 'Invalid CVV';
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        errors.upiId = 'Invalid UPI ID (e.g. mobile@paytm, user@okaxis)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
      }
    } else {
      if (!validatePayment()) return;

      setLoading(true);
      const shippingString = `${address.fullName}, Phone: ${address.phone}, Address: ${address.streetAddress}, ${address.city} - ${address.zipCode}`;
      
      let displayMethod = 'Card';
      if (paymentMethod === 'upi') displayMethod = 'UPI';
      if (paymentMethod === 'cod') displayMethod = 'Cash on Delivery';

      const result = await placeOrder(shippingString, displayMethod);
      setLoading(false);

      if (result.success) {
        setOrderSuccess(result.order);
      } else {
        alert(`Order placement failed: ${result.message}`);
      }
    }
  };


  // If order was successfully placed, display premium receipt screen
  if (orderSuccess) {
    return (
      <div className={`${styles.successWrapper} container animate-fade-in`}>
        <div className={`${styles.successCard} card`}>
          <div className={styles.successHeader}>
            <div className={styles.successIconCircle}>
              <CheckCircle size={48} />
            </div>
            <h1>Order Placed Successfully!</h1>
            <p className={styles.successSubtext}>
              Thank you for shopping with FreshCart. Your order has been placed and is currently being processed.
            </p>
          </div>

          <div className={styles.orderMetadata}>
            <div className={styles.metaRow}>
              <div>
                <span>Order ID</span>
                <strong>{orderSuccess.id}</strong>
              </div>
              <div>
                <span>Estimated Delivery</span>
                <strong>In 2 Hours (Today)</strong>
              </div>
            </div>
          </div>

          <div className={styles.successDetailsGrid}>
            <div>
              <h3><MapPin size={16} /> Delivery Address</h3>
              <p>{orderSuccess.shippingAddress}</p>
            </div>
            <div>
              <h3><Landmark size={16} /> Payment Method</h3>
              <p style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{orderSuccess.paymentMethod}</p>
            </div>
            <div>
              <h3><Truck size={16} /> Order Status</h3>
              <span className={`badge badge-success`}>{orderSuccess.status}</span>
            </div>
          </div>

          <div className={styles.receiptItems}>
            <h3>Items Ordered</h3>
            <div className={styles.receiptItemsList}>
              {orderSuccess.items.map((item, index) => (
                <div key={index} className={styles.receiptItem}>
                  <span>{item.name} <small>({item.unit})</small> <strong>x {item.quantity}</strong></span>
                  <span>₹{item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className={styles.divider} />
            <div className={styles.receiptTotalRow}>
              <span>Subtotal</span>
              <span>₹{orderSuccess.subtotal.toFixed(2)}</span>
            </div>
            <div className={styles.receiptTotalRow}>
              <span>Delivery Fee</span>
              <span>{orderSuccess.deliveryFee === 0 ? 'FREE' : `₹${orderSuccess.deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className={`${styles.receiptTotalRow} ${styles.receiptGrand}`}>
              <span>Grand Total</span>
              <span>₹{orderSuccess.total.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.successActions}>
            <Link to="/categories" className="btn btn-primary">Continue Shopping</Link>
            <Link to="/profile" className="btn btn-secondary">Track Order History</Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and order is not placed yet
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
        <div 
          onClick={() => step === 2 && setStep(1)}
          className={`${styles.stepIndicator} ${step >= 1 ? styles.stepActive : ''} ${step === 2 ? styles.stepClickable : ''}`}
        >
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Shipping Address</span>
        </div>
        <div className={`${styles.stepConnector} ${step >= 2 ? styles.stepConnectorActive : ''}`}></div>
        <div className={`${styles.stepIndicator} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Payment Method</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.layout}>
        {/* Left Column: Shipping or Payment Form depending on Step */}
        <div className={styles.formColumn}>
          {step === 1 && (
            <div className={`${styles.sectionCard} card animate-fade-in`}>
              <h2 className={styles.sectionTitle}><Truck size={20} /> Shipping Details</h2>
              <hr className={styles.divider} />
              
              <div className="form-group">
                <label className="form-label">Receiver's Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={address.fullName} 
                  onChange={(e) => handleInputChange(e, 'address')}
                  className="form-control"
                  placeholder="e.g. John Doe"
                />
                {formErrors.fullName && <span className={styles.errMessage}>{formErrors.fullName}</span>}
              </div>

              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={address.phone} 
                    onChange={(e) => handleInputChange(e, 'address')}
                    className="form-control"
                    placeholder="e.g. +1 555-019-2834"
                  />
                  {formErrors.phone && <span className={styles.errMessage}>{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={address.zipCode} 
                    onChange={(e) => handleInputChange(e, 'address')}
                    className="form-control"
                    placeholder="10001"
                  />
                  {formErrors.zipCode && <span className={styles.errMessage}>{formErrors.zipCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Street Address</label>
                <input 
                  type="text" 
                  name="streetAddress"
                  value={address.streetAddress} 
                  onChange={(e) => handleInputChange(e, 'address')}
                  className="form-control"
                  placeholder="Apartment, Street Name, Block"
                />
                {formErrors.streetAddress && <span className={styles.errMessage}>{formErrors.streetAddress}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  name="city"
                  value={address.city} 
                  onChange={(e) => handleInputChange(e, 'address')}
                  className="form-control"
                  placeholder="e.g. New York"
                />
                {formErrors.city && <span className={styles.errMessage}>{formErrors.city}</span>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`${styles.sectionCard} card animate-fade-in`}>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}><Landmark size={20} /> Payment Method</h2>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className={styles.editAddressBtn}
                >
                  Edit Address
                </button>
              </div>
              <hr className={styles.divider} />

              {/* Payment Method Selector Tabs */}
              <div className={styles.paymentTabs}>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('card')} 
                  className={`${styles.paymentTabBtn} ${paymentMethod === 'card' ? styles.paymentTabBtnActive : ''}`}
                >
                  <CreditCard size={20} />
                  <span>Credit/Debit Card</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('upi')} 
                  className={`${styles.paymentTabBtn} ${paymentMethod === 'upi' ? styles.paymentTabBtnActive : ''}`}
                >
                  <Smartphone size={20} />
                  <span>UPI ID</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('cod')} 
                  className={`${styles.paymentTabBtn} ${paymentMethod === 'cod' ? styles.paymentTabBtnActive : ''}`}
                >
                  <Coins size={20} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Conditional Input Rendering */}
              {paymentMethod === 'card' && (
                <div>
                  <div className="form-group">
                    <label className="form-label">Credit Card Number</label>
                    <input 
                      type="text" 
                      name="number"
                      value={card.number} 
                      onChange={(e) => handleInputChange(e, 'card')}
                      className="form-control"
                      placeholder="xxxx xxxx xxxx xxxx"
                      maxLength="19"
                    />
                    {formErrors.cardNumber && <span className={styles.errMessage}>{formErrors.cardNumber}</span>}
                  </div>

                  <div className={styles.formRow}>
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input 
                        type="text" 
                        name="expiry"
                        value={card.expiry} 
                        onChange={(e) => handleInputChange(e, 'card')}
                        className="form-control"
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                      {formErrors.cardExpiry && <span className={styles.errMessage}>{formErrors.cardExpiry}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input 
                        type="password" 
                        name="cvv"
                        value={card.cvv} 
                        onChange={(e) => handleInputChange(e, 'card')}
                        className="form-control"
                        placeholder="***"
                        maxLength="4"
                      />
                      {formErrors.cardCvv && <span className={styles.errMessage}>{formErrors.cardCvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className={styles.upiSection}>
                  <div className="form-group">
                    <label className="form-label">Enter UPI ID</label>
                    <input 
                      type="text" 
                      value={upiId} 
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-control"
                      placeholder="e.g. mobile@paytm or username@okaxis"
                    />
                    {formErrors.upiId && <span className={styles.errMessage}>{formErrors.upiId}</span>}
                  </div>
                  <p className={styles.upiInfo}>
                    💡 Please keep your UPI app open on your mobile device. We will send a payment notification link once you place the order.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className={styles.codSection}>
                  <h4 className={styles.codTitle}>🎉 Cash on Delivery Selected</h4>
                  <p className={styles.codDesc}>
                    You can pay with Cash, UPI, or Cards directly to our delivery partner when your fresh groceries reach your doorstep. No advance payment required!
                  </p>
                </div>
              )}
            </div>
          )}
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

            {step === 1 ? (
              <button 
                type="submit" 
                className={`btn btn-primary ${styles.orderBtn}`}
              >
                Proceed to Payment
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading}
                className={`btn btn-primary ${styles.orderBtn}`}
              >
                {loading ? 'Processing Order...' : `Pay & Place Order` }
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
