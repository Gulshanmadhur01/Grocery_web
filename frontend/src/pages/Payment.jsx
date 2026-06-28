import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ArrowLeft, Landmark, CreditCard, Smartphone, Coins, CheckCircle, MapPin, Truck } from 'lucide-react';
import styles from './Checkout.module.css'; // Reuse Checkout module CSS directly!

// Helper to dynamically load external scripts (Razorpay SDK)
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Payment = () => {
  const { cart, cartSubtotal, checkoutAddress, placeOrder } = useContext(AppContext);
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'upi', 'cod'
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });

  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Redirect back to checkout if shipping address is not filled
  useEffect(() => {
    if (!checkoutAddress || !checkoutAddress.fullName.trim()) {
      navigate('/checkout');
    }
  }, [checkoutAddress, navigate]);

  const deliveryFee = cartSubtotal > 1000 ? 0 : 99;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
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
        errors.upiId = 'Invalid UPI ID (e.g. mobile@paytm or user@okaxis)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validatePayment()) return;

    setLoading(true);
    const shippingString = `${checkoutAddress.fullName}, Phone: ${checkoutAddress.phone}, Address: ${checkoutAddress.streetAddress}, ${checkoutAddress.city} - ${checkoutAddress.zipCode}`;
    
    if (paymentMethod === 'cod') {
      // Cash on Delivery - Instant Placement
      const result = await placeOrder(shippingString, 'Cash on Delivery');
      setLoading(false);
      if (result.success) {
        setOrderSuccess(result.order);
      } else {
        alert(`Order placement failed: ${result.message}`);
      }
    } else {
      // Card / UPI - Launch Razorpay Interactive Test Payment Gateway
      const src = 'https://checkout.razorpay.com/v1/checkout.js';
      const loaded = await loadScript(src);
      if (!loaded) {
        alert('Razorpay Checkout failed to load. Please check your network connection.');
        setLoading(false);
        return;
      }

      const options = {
        key: 'rzp_test_public_sandbox_key', // Dummy sandbox key to initialize checkout window
        amount: Math.round(grandTotal * 100), // in paise
        currency: 'INR',
        name: 'FreshMart Checkout',
        description: 'Secure Payment Gateway (Test Mode)',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop',
        handler: async function (response) {
          const paymentId = response.razorpay_payment_id;
          const displayMethod = paymentMethod === 'upi' ? `UPI (${upiId})` : 'Card';
          const result = await placeOrder(shippingString, `${displayMethod} - Razorpay ID: ${paymentId}`);
          setLoading(false);
          if (result.success) {
            setOrderSuccess(result.order);
          } else {
            alert(`Order placement failed: ${result.message}`);
          }
        },
        prefill: {
          name: checkoutAddress.fullName,
          contact: checkoutAddress.phone,
          email: 'customer@freshmart.com'
        },
        notes: {
          address: shippingString
        },
        theme: {
          color: '#10b981' // Organic green brand header color
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      try {
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } catch (err) {
        console.error('Razorpay Modal error:', err);
        alert('Razorpay simulation failed. Placing order in offline mode...');
        const displayMethod = paymentMethod === 'upi' ? `UPI (${upiId})` : 'Card';
        const result = await placeOrder(shippingString, `${displayMethod} (Simulated)`);
        setLoading(false);
        if (result.success) {
          setOrderSuccess(result.order);
        } else {
          alert(`Order placement failed: ${result.message}`);
        }
      }
    }
  };

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
              Thank you for shopping with FreshMart. Your order has been placed and is currently being processed.
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

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>Checkout</h1>
        <button onClick={() => navigate('/checkout')} className={styles.backBtn}><ArrowLeft size={16} /> Back to Shipping</button>
      </div>

      {/* Progressive Step Progress Tracker */}
      <div className={styles.progressTracker}>
        <div 
          onClick={() => navigate('/checkout')}
          className={`${styles.stepIndicator} ${styles.stepActive} ${styles.stepClickable}`}
        >
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Shipping Address</span>
        </div>
        <div className={`${styles.stepConnector} ${styles.stepConnectorActive}`}></div>
        <div className={`${styles.stepIndicator} ${styles.stepActive}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Payment Method</span>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className={styles.layout}>
        {/* Left Column: Payment selector */}
        <div className={styles.formColumn}>
          <div className={`${styles.sectionCard} card`}>
            <div className={styles.sectionHeaderRow}>
              <h2 className={styles.sectionTitle}><Landmark size={20} /> Payment Method</h2>
              <button 
                type="button" 
                onClick={() => navigate('/checkout')} 
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
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
              disabled={loading}
              className={`btn btn-primary ${styles.orderBtn}`}
            >
              {loading ? 'Processing Order...' : `Pay & Place Order` }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Payment;
