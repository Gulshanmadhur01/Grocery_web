import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import OptimizedImage from './OptimizedImage';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import styles from './CartDrawer.module.css';

const CartDrawer = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    cartDrawerOpen,
    setCartDrawerOpen
  } = useContext(AppContext);

  const navigate = useNavigate();
  const drawerRef = useRef();

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setCartDrawerOpen(false);
    };
    if (cartDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent main body scrolling
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [cartDrawerOpen, setCartDrawerOpen]);

  // Click outside to close
  const handleOverlayClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      setCartDrawerOpen(false);
    }
  };

  const handleCheckoutClick = () => {
    setCartDrawerOpen(false);
    navigate('/checkout');
  };

  if (!cartDrawerOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.drawer} ref={drawerRef}>
        {/* Drawer Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <ShoppingBag size={20} className={styles.bagIcon} />
            <h2>My Cart <span className={styles.countText}>({cartCount} {cartCount === 1 ? 'item' : 'items'})</span></h2>
          </div>
          <button onClick={() => setCartDrawerOpen(false)} className={styles.closeBtn} title="Close Cart">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className={styles.body}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <ShoppingBag size={48} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Add items to your cart to see them here.</p>
              <button 
                onClick={() => { setCartDrawerOpen(false); navigate('/categories'); }} 
                className={styles.shopBtn}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className={styles.itemsList}>
              <div className={styles.deliveryPromo}>
                🚚 Delivery in <strong style={{ color: 'var(--success)' }}>12 MINS</strong>!
              </div>

              {cart.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  {/* Product Image */}
                  <div className={styles.imgWrapper}>
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      fallbackType="product"
                      aspectRatio="1/1"
                    />
                  </div>

                  {/* Product Details */}
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <span className={styles.itemUnit}>{item.unit}</span>
                    <span className={styles.itemPrice}>₹{item.price}</span>
                  </div>

                  {/* Quantity Actions */}
                  <div className={styles.qtyContainer}>
                    <div className={styles.qtyController}>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className={styles.qtyBtn}
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qtyVal}>{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className={styles.qtyBtn}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className={styles.deleteBtn}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className={styles.itemSubtotal}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong className={styles.subtotalVal}>₹{cartSubtotal}</strong>
            </div>
            <p className={styles.footerDisclaimer}>Promo codes & shipping fees applied at checkout.</p>
            
            <button onClick={handleCheckoutClick} className={styles.checkoutBtn}>
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
