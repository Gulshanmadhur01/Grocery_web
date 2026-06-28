import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import styles from './BannerCarousel.module.css';

const BannerCarousel = () => {
  const slides = [
    {
      id: 1,
      title: 'Fresh Fruits & Veggies',
      subtitle: 'Flat 20% OFF on organic items harvested directly from local farms.',
      btnText: 'Shop Produce',
      btnLink: '/categories?category=fruits-vegetables',
      code: 'FRESHVEC20',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      title: 'Dairy & Breakfast Deals',
      subtitle: 'Stock up on farm fresh milk, salted butter, free range eggs and cereals.',
      btnText: 'Browse Dairy',
      btnLink: '/categories?category=dairy-eggs',
      code: 'WELCOME10',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1000&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Sweets & Munchies Week',
      subtitle: 'Satisfy your sweet tooth cravings with premium vanilla chocolates and ice cream.',
      btnText: 'View Snacks',
      btnLink: '/categories?category=sweet-tooth',
      code: 'WELCOME10',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1000&auto=format&fit=crop&q=80'
    }
  ];

  const [current, setCurrent] = useState(0);

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrent(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className={styles.carouselContainer}>
      {/* Slide Content wrapper */}
      <div 
        className={styles.slidesWrapper} 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slide}>
            {/* Banner Background Image */}
            <div className={styles.imageOverlay}>
              <OptimizedImage
                src={slide.image}
                alt={slide.title}
                fallbackType="banner"
                aspectRatio="21/9"
                objectFit="cover"
              />
            </div>
            
            {/* Text Overlay Card */}
            <div className={styles.contentCard}>
              <div className={styles.tag}>
                <Sparkles size={12} /> Special Promotion
              </div>
              <h2 className={styles.slideTitle}>{slide.title}</h2>
              <p className={styles.slideDesc}>{slide.subtitle}</p>
              
              <div className={styles.codeRow}>
                Use Code: <strong className={styles.codeText}>{slide.code}</strong>
              </div>
              
              <Link to={slide.btnLink} className={styles.ctaBtn}>
                {slide.btnText}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <button onClick={handlePrev} className={`${styles.navBtn} ${styles.prev}`} title="Previous Slide">
        <ChevronLeft size={20} />
      </button>
      <button onClick={handleNext} className={`${styles.navBtn} ${styles.next}`} title="Next Slide">
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div className={styles.dotsRow}>
        {slides.map((_, index) => (
          <button 
            key={index} 
            onClick={() => setCurrent(index)}
            className={`${styles.dot} ${index === current ? styles.activeDot : ''}`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
