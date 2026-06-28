import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, CreditCard } from 'lucide-react';
import OptimizedImage from '../components/OptimizedImage';
import styles from './Cart.jsx.module.css';

const Cart = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    cartSubtotal,
    user
  } = useContext(AppContext);

  const navigate = useNavigate();

  const deliveryFee = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 99;
  const grandTotal = cartSubtotal + deliveryFee;

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/profile?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className={`${styles.emptyCart} container animate-fade-in`}>
        <div className={styles.emptyIconCircle}>
          <ShoppingCart size={48} />
        </div>
        <h2>Your Shopping Cart is Empty</h2>
        <p>Looks like you haven't added any fresh groceries to your cart yet.</p>
        <Link to="/categories" className="btn btn-primary">
          Start Shopping <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>Shopping Cart</h1>
        <Link to="/categories" className={styles.continueShop}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Cart Items List */}
        <div className={styles.itemsColumn}>
          {cart.map((item) => (
            <div key={item.id} className={`${styles.cartItem} card`}>
              <div className={styles.itemImageWrapper}>
                <OptimizedImage 
                  src={item.image} 
                  alt={item.name} 
                  fallbackType="product"
                  aspectRatio="1/1"
                />
              </div>
              
              <div className={styles.itemDetails}>
                <span className={styles.itemCategory}>{item.category.replace('-', ' ')}</span>
                <h3 className={styles.itemName}>
                  <Link to={`/product/${item.id}`}>{item.name}</Link>
                </h3>
                <p className={styles.itemUnit}>{item.unit}</p>
                <div className={styles.itemPriceMobile}>₹{item.price.toFixed(2)}</div>
              </div>

              {/* Quantity Changer */}
              <div className={styles.qtyContainer}>
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                  className={styles.qtyBtn}
                >
                  <Minus size={14} />
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button 
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                  className={styles.qtyBtn}
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Price Calculation */}
              <div className={styles.priceContainer}>
                <span className={styles.totalPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
                <span className={styles.unitPrice}>₹{item.price.toFixed(2)} / unit</span>
              </div>

              {/* Remove Action */}
              <button 
                onClick={() => removeFromCart(item.id)}
                className={styles.removeBtn}
                title="Remove Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Right Column: Bill Summary Checkout */}
        <div className={styles.summaryColumn}>
          <div className={`${styles.summaryCard} card`}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <hr className={styles.divider} />

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>₹{cartSubtotal.toFixed(2)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className={styles.freeDelivery}>FREE</span>
              ) : (
                <strong>₹{deliveryFee.toFixed(2)}</strong>
              )}
            </div>

            {deliveryFee > 0 && (
              <div className={styles.deliveryWarning}>
                Add <strong>₹{(1000 - cartSubtotal).toFixed(2)}</strong> more to get <strong>FREE delivery!</strong>
              </div>
            )}

            <hr className={styles.divider} />

            <div className={`${styles.summaryRow} ${styles.grandTotalRow}`}>
              <span>Total Amount</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            <button onClick={handleCheckoutClick} className={`btn btn-primary ${styles.checkoutBtn}`}>
              <CreditCard size={18} /> Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

