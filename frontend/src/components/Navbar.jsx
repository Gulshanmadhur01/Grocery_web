import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { ShoppingBasket, Search, User, LogOut, LayoutDashboard, ShoppingCart, MapPin, Truck, HelpCircle } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { 
    user, logout, 
    cartCount, 
    searchQuery, setSearchQuery,
    setActiveCategory,
    deliveryLocation, setShowLocationModal
  } = useContext(AppContext);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    navigate('/shop');
  };

  const handleLogoClick = () => {
    setSearchQuery('');
    setSearchInput('');
    setActiveCategory('all');
  };

  return (
    <header className={styles.header}>
      {/* 1. Thin Green Top Promo & Location Bar */}
      <div className={styles.topBar}>
        <div className={`${styles.topBarContainer} container`}>
          <div className={styles.promoText}>
            Get 10% OFF on your first order. Use code: <span className={styles.promoCode}>WELCOME10</span>
          </div>
          <div className={styles.topBarLinks}>
            <button onClick={() => setShowLocationModal(true)} className={styles.topBarLinkItemBtn}>
              <MapPin size={13} />
              <span>Delivery in <strong className={styles.deliveryTimeText}>12 MINS</strong> to: <strong>{deliveryLocation ? (deliveryLocation.length > 25 ? deliveryLocation.slice(0, 25) + '...' : deliveryLocation) : 'Select Location'}</strong></span>
            </button>
            <div className={styles.topBarDivider}>|</div>
            <Link to="/profile" className={styles.topBarLinkItem}>
              <Truck size={13} />
              <span>Track Order</span>
            </Link>
            <div className={styles.topBarDivider}>|</div>
            <div className={styles.topBarLinkItem}>
              <HelpCircle size={13} />
              <span>Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Middle Navigation Header */}
      <div className={styles.mainNav}>
        <div className={`${styles.mainNavContainer} container`}>
          {/* Logo */}
          <Link to="/" className={styles.logo} onClick={handleLogoClick}>
            <ShoppingBasket className={styles.logoIcon} />
            <span>Fresh<span className={styles.logoAccent}>Mart</span></span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input 
              type="text" 
              placeholder="Search for products, categories..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className={styles.actions}>


            {/* User Account / Profile */}
            {user ? (
              <div className={styles.profileWrapper}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)} 
                  className={styles.userBtn}
                >
                  <User size={20} className={styles.actionIcon} />
                  <div className={styles.userText}>
                    <span className={styles.userLabel}>Hello,</span>
                    <span className={styles.username}>{user.name.split(' ')[0]}</span>
                  </div>
                </button>
                
                {profileDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownHeader}>
                      <strong>{user.name}</strong>
                      <span>{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
                    </div>
                    <hr className={styles.divider} />
                    
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className={styles.dropdownItem}
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    
                    <Link 
                      to="/profile" 
                      className={styles.dropdownItem}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User size={16} /> My Profile
                    </Link>

                    <button 
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }} 
                      className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/profile" className={styles.userBtn}>
                <User size={20} className={styles.actionIcon} />
                <div className={styles.userText}>
                  <span className={styles.userLabel}>Account</span>
                  <span className={styles.username}>Login / Sign up</span>
                </div>
              </Link>
            )}

            {/* Cart Button */}
            <Link to="/cart" className={styles.cartBtn} title="Shopping Cart">
              <div className={styles.cartIconWrapper}>
                <ShoppingCart size={20} className={styles.actionIcon} />
                {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
              </div>
              <span className={styles.cartLabel}>Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Sub-header Menu Links */}
      <nav className={styles.menuNav}>
        <div className={`${styles.menuNavContainer} container`}>
          <Link to="/" className={`${styles.menuLink} ${location.pathname === '/' ? styles.activeMenuLink : ''}`}>Home</Link>
          <Link to="/shop" className={`${styles.menuLink} ${location.pathname === '/shop' ? styles.activeMenuLink : ''}`}>Shop</Link>
          <Link to="/shop" onClick={() => setActiveCategory('fruits-vegetables')} className={styles.menuLink}>Categories</Link>
          <Link to="/shop?sort=rating" className={styles.menuLink}>Offers</Link>
          <Link to="/" className={styles.menuLink}>About Us</Link>
          <Link to="/" className={styles.menuLink}>Contact Us</Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
