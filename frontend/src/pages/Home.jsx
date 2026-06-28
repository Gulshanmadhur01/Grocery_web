import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { 
  ArrowRight, ShieldCheck, Truck, RefreshCw, BadgePercent, Award, 
  Star
} from 'lucide-react';
import styles from './Home.module.css';

const Home = () => {
  const { 
    products, 
    categories, 
    loading, 
    setActiveCategory, 
    setSearchQuery,
    addToCart
  } = useContext(AppContext);
  
  const [dealProducts, setDealProducts] = useState([]);
  const navigate = useNavigate();

  // Get 2 quick-add products for the hero banner
  const bannerProducts = products.length > 0 
    ? products.filter(p => ['prod-2', 'prod-13'].includes(p.id)) 
    : [
        { id: "prod-2", name: "Banana", price: 48, unit: "1kg", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80" },
        { id: "prod-13", name: "Amul Taaza Milk", price: 54, unit: "1L", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&auto=format&fit=crop&q=80" }
      ];

  useEffect(() => {
    if (products.length > 0) {
      // Find the specific deals products to display (Apples, Bananas, Atta, Tomato, Milk)
      const deals = products.filter(p => 
        ['prod-2', 'prod-13', 'prod-14', 'prod-5'].includes(p.id)
      );
      setDealProducts(deals.length > 0 ? deals : products.slice(0, 4));
    }
  }, [products]);

  // Testimonials seed
  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      role: 'Home Maker',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Super fast delivery and fresh vegetables. I love shopping from FreshMart! Highly recommended.'
    },
    {
      id: 2,
      name: 'Rahul Verma',
      role: 'Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'Best quality products at the best prices. Highly recommended! Very convenient for daily shopping.'
    },
    {
      id: 3,
      name: 'Neha Singh',
      role: 'Fitness Coach',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
      rating: 5,
      comment: 'I get all my daily essentials in one place. Very convenient and reliable. Great organic options.'
    }
  ];

  return (
    <div className={styles.homeWrapper}>
      {/* 1. Custom Hero Banner Section */}
      <section className={`${styles.hero} container`}>
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <span className={styles.heroTagline}>🥬 100% Organic & Fresh Daily</span>
            <h1 className={styles.heroTitle}>
              Freshness Delivered <br />
              <span className={styles.heroTitleAccent}>to Your Kitchen</span>
            </h1>
            <p className={styles.heroDescription}>
              Handpicked premium fruits, farm-fresh vegetables, dairy, and pantry staples. Delivered straight to your doorstep in minutes.
            </p>
            
            <div className={styles.heroCta}>
              <Link to="/shop" className={styles.heroShopNowBtn}
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              >
                Shop Now <ArrowRight size={18} />
              </Link>
              <span className={styles.heroDeliveryGuarantee}>⚡ Delivered in minutes</span>
            </div>
          </div>
          
          <div className={styles.heroShowcaseColumn}>
            <div className={styles.showcaseCard}>
              <h3 className={styles.showcaseTitle}>Today's Hot Sellers</h3>
              <div className={styles.showcaseProducts}>
                {bannerProducts.map((product) => (
                  <div key={product.id} className={styles.miniProductCard}>
                    <div className={styles.miniImageWrapper}>
                      <img 
                        src={product.image || '/assets/images/placeholder.svg'} 
                        alt={product.name} 
                        className={styles.miniImage} 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className={styles.miniProductInfo}>
                      <strong className={styles.miniProductName}>{product.name}</strong>
                      <span className={styles.miniProductPrice}>₹{product.price} / {product.unit}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className={styles.miniAddBtn}
                      title="Add to Cart"
                    >
                      Add +
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Shop by Categories - Blinkit Style */}
      <section className={`${styles.categoriesSection} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <Link to="/shop" className={styles.viewAllLink}>
            See all <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <Link 
              to={`/shop?category=${cat.slug}`} 
              key={cat.id} 
              className={styles.categoryCard}
              onClick={() => {
                setActiveCategory(cat.slug);
                setSearchQuery('');
              }}
            >
              <div className={styles.categoryThumbWrapper}>
                <img 
                  src={cat.image || '/assets/images/placeholder.svg'} 
                  alt={cat.name} 
                  className={styles.categoryThumb} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/placeholder.svg';
                  }}
                />
              </div>
              <span className={styles.categoryName}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Today's Best Deals */}
      <section className={`${styles.dealsSection} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Best Deals</h2>
          <Link to="/shop" className={styles.viewAllLink}>
            View all deals <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.loadingSpinner}>Loading awesome deals...</div>
        ) : (
          <div className={styles.productsGrid}>
            {dealProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>



      {/* 6. What Our Customers Say (Testimonials) */}
      <section className={`${styles.testimonialsSection} container`}>
        <div className={styles.sectionHeaderCentered}>
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <div className={styles.starsRow}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--secondary)" color="var(--secondary)" />)}
            <span className={styles.starsText}><strong>4.8/5</strong> From 25,000+ happy customers</span>
          </div>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((t) => (
            <div key={t.id} className={`${styles.testimonialCard} card`}>
              <div className={styles.testimonialStars}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="var(--secondary)" color="var(--secondary)" />
                ))}
              </div>
              <p className={styles.comment}>"{t.comment}"</p>
              <div className={styles.customerProfile}>
                <img 
                  src={t.avatar || '/assets/images/placeholder.svg'} 
                  alt={t.name} 
                  className={styles.customerAvatar} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/placeholder.svg';
                  }}
                />
                <div className={styles.customerDetails}>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Trust Badges Row (Moved to bottom) */}
      <section className={`${styles.trustSection} container`}>
        <div className={styles.trustGrid}>
          <div className={styles.trustItem}>
            <Award className={styles.trustIcon} size={22} />
            <div className={styles.trustText}>
              <strong>Fresh Products</strong>
              <span>100% Quality</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <Truck className={styles.trustIcon} size={22} />
            <div className={styles.trustText}>
              <strong>Fast Delivery</strong>
              <span>30 Min Delivery</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <BadgePercent className={styles.trustIcon} size={22} />
            <div className={styles.trustText}>
              <strong>Best Prices</strong>
              <span>Save More</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <ShieldCheck className={styles.trustIcon} size={22} />
            <div className={styles.trustText}>
              <strong>Secure Payment</strong>
              <span>100% Safe</span>
            </div>
          </div>
          <div className={styles.trustItem}>
            <RefreshCw className={styles.trustIcon} size={22} />
            <div className={styles.trustText}>
              <strong>Easy Returns</strong>
              <span>Hassle Free</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
