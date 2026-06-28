import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import OptimizedImage from '../components/OptimizedImage';
import { Tag, Sparkles, Copy, Check } from 'lucide-react';
import styles from './Offers.module.css';

const Offers = () => {
  const { products, loading } = useContext(AppContext);
  const [dealProducts, setDealProducts] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const promoCodes = [
    { code: 'WELCOME10', discount: '10% OFF', description: 'On your first grocery order', minOrder: '₹300' },
    { code: 'FRESHVEC20', discount: '20% OFF', description: 'On fresh fruits & vegetables', minOrder: '₹500' },
    { code: 'FASTFREE', discount: 'FREE DELIVERY', description: 'Get free shipping on your basket', minOrder: '₹200' },
  ];

  useEffect(() => {
    if (products.length > 0) {
      // Products with rating > 4.7 are categorized as promotional/deals
      const highRated = products.filter(p => p.rating >= 4.7).slice(0, 8);
      setDealProducts(highRated);
    }
  }, [products]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`${styles.offersWrapper} container animate-fade-in`}>
      {/* Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.badge}><Sparkles size={14} /> Super Saving Week</div>
          <h1 className={styles.title}>Deals & Offers</h1>
          <p className={styles.subtitle}>Get maximum discount on fresh produce, dairy, bakery, and pantry essentials.</p>
        </div>
        <div className={styles.heroImageWrapper}>
          <OptimizedImage
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80"
            alt="Grocery Deals Banner"
            fallbackType="banner"
            aspectRatio="16/9"
          />
        </div>
      </section>

      {/* Promos Section */}
      <section className={styles.promosSection}>
        <h2 className={styles.sectionTitle}>Active Promo Codes</h2>
        <div className={styles.promosGrid}>
          {promoCodes.map((promo) => (
            <div key={promo.code} className={styles.promoCard}>
              <div className={styles.promoDiscount}>{promo.discount}</div>
              <div className={styles.promoDetails}>
                <strong className={styles.promoTitle}>{promo.code}</strong>
                <span className={styles.promoDesc}>{promo.description}</span>
                <span className={styles.promoMin}>Min. order: {promo.minOrder}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(promo.code)}
                className={`${styles.copyBtn} ${copiedCode === promo.code ? styles.copied : ''}`}
              >
                {copiedCode === promo.code ? (
                  <>
                    <Check size={16} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy Code
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Deal Products Section */}
      <section className={styles.dealsSection}>
        <h2 className={styles.sectionTitle}>Exclusive Deal Items</h2>
        {loading ? (
          <div className={styles.loadingSkeleton}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {dealProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Offers;
