import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { User, Mail, Calendar, Key, UserCheck, Package, ShoppingBag, Eye } from 'lucide-react';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, login, register, orders, fetchOrders } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle routing redirects
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');

  // Form toggles
  const [isRegister, setIsRegister] = useState(false);
  
  // Auth Form states
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Accordion state to open/close order item details
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
      if (redirect === 'checkout') {
        navigate('/checkout');
      }
    }
  }, [user, redirect]);

  const handleInputChange = (e) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (isRegister) {
      // Register validation
      if (!authData.name || !authData.email || !authData.password) {
        setAuthError('All fields are required');
        setAuthLoading(false);
        return;
      }
      if (authData.password !== authData.confirmPassword) {
        setAuthError('Passwords do not match');
        setAuthLoading(false);
        return;
      }

      const res = await register(authData.name, authData.email, authData.password);
      if (!res.success) {
        setAuthError(res.message);
      }
    } else {
      // Login validation
      if (!authData.email || !authData.password) {
        setAuthError('Email and password are required');
        setAuthLoading(false);
        return;
      }

      const res = await login(authData.email, authData.password);
      if (!res.success) {
        setAuthError(res.message);
      }
    }
    setAuthLoading(false);
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(prev => (prev === orderId ? null : orderId));
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'badge-success';
      case 'Cancelled': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  // 1. Not Logged In - Render Auth Portal Forms
  if (!user) {
    return (
      <div className={`${styles.authWrapper} container animate-fade-in`}>
        <div className={`${styles.authCard} card`}>
          <div className={styles.authHeader}>
            <div className={styles.authIconCircle}>
              <UserCheck size={32} />
            </div>
            <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
            <p>
              {isRegister 
                ? 'Sign up to shop organic groceries and track fresh deliveries.' 
                : 'Log in to access your orders, cart, and profile details.'}
            </p>
          </div>

          {authError && <div className={styles.authError}>{authError}</div>}

          <form onSubmit={handleAuthSubmit}>
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className={styles.inputWrapper}>
                  <User size={18} className={styles.inputIcon} />
                  <input 
                    type="text" 
                    name="name" 
                    value={authData.name} 
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="email" 
                  name="email" 
                  value={authData.email} 
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={styles.inputWrapper}>
                <Key size={18} className={styles.inputIcon} />
                <input 
                  type="password" 
                  name="password" 
                  value={authData.password} 
                  onChange={handleInputChange}
                  className="form-control" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Key size={18} className={styles.inputIcon} />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={authData.confirmPassword} 
                    onChange={handleInputChange}
                    className="form-control" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={authLoading} className={`btn btn-primary ${styles.authBtn}`}>
              {authLoading ? 'Verifying...' : isRegister ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className={styles.authToggle}>
            <span>
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"}
            </span>
            <button 
              type="button" 
              onClick={() => {
                setIsRegister(!isRegister);
                setAuthError('');
              }}
            >
              {isRegister ? 'Log In Instead' : 'Register Here'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Logged In - Render Profile Dashboard
  return (
    <div className="container animate-fade-in">
      <div className={styles.header}>
        <h1 className={styles.title}>My Account</h1>
      </div>

      <div className={styles.layout}>
        {/* Profile Card Summary */}
        <aside className={styles.sidebarColumn}>
          <div className={`${styles.profileCard} card`}>
            <div className={styles.avatarCircle}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <span className={styles.roleBadge}>{user.role}</span>
            <hr className={styles.divider} />
            
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Order History list */}
        <main className={styles.historyColumn}>
          <div className={`${styles.historyCard} card`}>
            <h3 className={styles.historyTitle}><Package size={20} /> Order History</h3>
            <hr className={styles.divider} />

            {orders.length === 0 ? (
              <div className={styles.noOrders}>
                <ShoppingBag size={48} className={styles.noOrdersIcon} />
                <h3>No Orders Placed Yet</h3>
                <p>Browse products and place your first grocery order today!</p>
                <Link to="/categories" className="btn btn-primary">Start Browsing</Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMeta}>
                        <strong>Order #{order.id.slice(-6)}</strong>
                        <span className={styles.orderDate}>
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.orderActions}>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <button 
                          onClick={() => toggleOrderExpand(order.id)}
                          className={styles.viewItemsBtn}
                          title="View Items"
                        >
                          <Eye size={16} /> Items
                        </button>
                      </div>
                    </div>

                    <div className={styles.orderSummaryInfo}>
                      <span>Subtotal: ₹{order.subtotal.toFixed(2)}</span>
                      <span>Delivery: {order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee.toFixed(2)}`}</span>
                      <strong className={styles.orderTotal}>Total Paid: ₹{order.total.toFixed(2)}</strong>
                    </div>

                    {/* Accordion Expandable Items List */}
                    {expandedOrder === order.id && (
                      <div className={styles.expandedItems}>
                        <div className={styles.addressSection}>
                          <strong>Shipping Details:</strong>
                          <p>{order.shippingAddress}</p>
                        </div>
                        <div className={styles.itemsSummaryList}>
                          <strong>Items Ordered:</strong>
                          {order.items.map((item, index) => (
                            <div key={index} className={styles.itemRow}>
                              <span>
                                {item.name} <small>({item.unit})</small> <strong>x {item.quantity}</strong>
                              </span>
                              <span>₹{item.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
