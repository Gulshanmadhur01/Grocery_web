import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Mail, Phone, MapPin } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        {/* Branding Column */}
        <div className={styles.columnBrand}>
          <Link to="/" className={styles.logo}>
            <ShoppingBag className={styles.logoIcon} />
            <span>Fresh<span className={styles.logoAccent}>Mart</span></span>
          </Link>
          <p className={styles.description}>
            Your premium online grocery store. Delivering fresh organic vegetables, fruits, dairy products, bakery, and snacks straight to your doorstep.
          </p>
        </div>

        {/* Categories Navigation */}
        <div className={styles.column}>
          <h4 className={styles.heading}>Categories</h4>
          <ul className={styles.linksList}>
            <li><Link to="/categories?category=fruits-vegetables">Fruits & Vegetables</Link></li>
            <li><Link to="/categories?category=dairy-eggs">Dairy & Eggs</Link></li>
            <li><Link to="/categories?category=bakery">Bakery & Biscuits</Link></li>
            <li><Link to="/categories?category=beverages">Beverages</Link></li>
            <li><Link to="/categories?category=sweet-tooth">Sweet Tooth</Link></li>
          </ul>
        </div>

        {/* Quick Links Navigation */}
        <div className={styles.column}>
          <h4 className={styles.heading}>Quick Links</h4>
          <ul className={styles.linksList}>
            <li><Link to="/categories">Browse Categories</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/profile">My Account</Link></li>
            <li><Link to="/admin">Admin Dashboard</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className={styles.column}>
          <h4 className={styles.heading}>Contact Us</h4>
          <ul className={styles.contactList}>
            <li>
              <MapPin size={16} className={styles.contactIcon} />
              <span>123 Green Valley St, Organic City</span>
            </li>
            <li>
              <Phone size={16} className={styles.contactIcon} />
              <span>+1 (555) 987-6543</span>
            </li>
            <li>
              <Mail size={16} className={styles.contactIcon} />
              <span>support@freshmart.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={`${styles.bottomContainer} container`}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} FreshMart. All rights reserved.
          </p>
          <p className={styles.maker}>
            Made with <Heart size={14} className={styles.heartIcon} /> for a healthy life.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

