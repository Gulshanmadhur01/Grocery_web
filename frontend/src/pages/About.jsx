import React from 'react';
import OptimizedImage from '../components/OptimizedImage';
import { Leaf, Clock, Heart, Award } from 'lucide-react';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={`${styles.aboutWrapper} container animate-fade-in`}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>About FreshMart</h1>
          <p className={styles.lead}>
            We are redefining how India shops for groceries. FreshMart is a premium full-stack quick-commerce platform delivering fresh vegetables, daily essentials, and gourmet staples straight to your door in minutes.
          </p>
        </div>
        <div className={styles.heroImage}>
          <OptimizedImage
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
            alt="Fresh Fruits and Vegetables Store"
            fallbackType="banner"
            aspectRatio="16/10"
          />
        </div>
      </section>

      {/* Core Values */}
      <section className={styles.valuesSection}>
        <h2 className={styles.sectionTitle}>Why Choose FreshMart?</h2>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <div className={`${styles.iconWrapper} ${styles.green}`}>
              <Leaf size={24} />
            </div>
            <h3>100% Farm Fresh</h3>
            <p>Our fruits and vegetables are sourced directly from local farms every morning to ensure you get the absolute best quality and nutrition.</p>
          </div>

          <div className={styles.valueCard}>
            <div className={`${styles.iconWrapper} ${styles.blue}`}>
              <Clock size={24} />
            </div>
            <h3>Super Fast Delivery</h3>
            <p>Utilizing our hyper-local network of dark stores, our professional riders deliver your order in just 10 to 15 minutes, fresh and secure.</p>
          </div>

          <div className={styles.valueCard}>
            <div className={`${styles.iconWrapper} ${styles.gold}`}>
              <Award size={24} />
            </div>
            <h3>Highest Quality Checks</h3>
            <p>Every single item undergoes strict 3-stage visual inspection and packaging checks before hitting the delivery bag.</p>
          </div>

          <div className={styles.valueCard}>
            <div className={`${styles.iconWrapper} ${styles.red}`}>
              <Heart size={24} />
            </div>
            <h3>Customer First Service</h3>
            <p>Got a problem with your order? Our instant live-chat support resolves queries and handles refunds in under 2 minutes, hassle-free.</p>
          </div>
        </div>
      </section>

      {/* Our Story / Mission */}
      <section className={styles.storySection}>
        <div className={styles.storyImage}>
          <OptimizedImage
            src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80"
            alt="Delivery Driver riding scooter"
            fallbackType="banner"
            aspectRatio="4/3"
          />
        </div>
        <div className={styles.storyText}>
          <h2 className={styles.sectionTitle}>Our Mission</h2>
          <p>
            Founded with the simple idea that grocery shopping shouldn't consume hours of your week, FreshMart bridges the gap between premium local farmers and urban families. 
          </p>
          <p>
            By leveraging local storage, high-efficiency sorting lines, and environment-friendly delivery techniques, we ensure that zero emissions are generated while transporting your fresh greens. We are proud to serve over 100,000+ happy homes across 5 major metro areas, ensuring that healthy food is accessible to everyone in real-time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
