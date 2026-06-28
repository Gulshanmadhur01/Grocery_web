import React, { useState, useEffect } from 'react';
import styles from './OptimizedImage.module.css';

// 1. Inline SVG for Product Fallback
const ProductSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fallbackIcon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

// 2. Inline SVG for Category Fallback
const CategorySVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fallbackIcon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

// 3. Inline SVG for User Avatar Fallback
const AvatarSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fallbackIcon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// 4. Inline SVG for Banner Fallback
const BannerSVG = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fallbackIcon}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 00-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 00-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
  </svg>
);

const OptimizedImage = ({
  src,
  alt = 'Grocery Image',
  className = '',
  style = {},
  fallbackType = 'product', // 'product' | 'category' | 'avatar' | 'banner'
  zoomOnHover = false,
  aspectRatio = '1/1',
  objectFit = 'cover'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(null);

  useEffect(() => {
    // Reset states when src changes
    setLoading(true);
    setError(false);

    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
  }, [src]);

  const renderFallback = () => {
    switch (fallbackType) {
      case 'category':
        return (
          <div className={`${styles.fallbackContainer} ${styles.categoryFallback}`}>
            <CategorySVG />
          </div>
        );
      case 'avatar':
        return (
          <div className={`${styles.fallbackContainer} ${styles.avatarFallback}`}>
            <AvatarSVG />
          </div>
        );
      case 'banner':
        return (
          <div className={`${styles.fallbackContainer} ${styles.bannerFallback}`}>
            <BannerSVG />
          </div>
        );
      case 'product':
      default:
        return (
          <div className={`${styles.fallbackContainer} ${styles.productFallback}`}>
            <ProductSVG />
          </div>
        );
    }
  };

  const containerClasses = [
    styles.imageContainer,
    zoomOnHover ? styles.zoomEffect : '',
    className
  ].join(' ').trim();

  return (
    <div 
      className={containerClasses} 
      style={{ aspectRatio, ...style }}
    >
      {/* Shimmer loading skeleton */}
      {loading && (
        <div className={styles.skeleton}>
          <div className={styles.shimmer} />
        </div>
      )}

      {/* Render the image if successful */}
      {!loading && !error && currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`${styles.image} ${loading ? styles.imageHidden : styles.imageLoaded}`}
          style={{ objectFit }}
          loading="lazy"
        />
      )}

      {/* Render the fallback vector/SVG on error */}
      {!loading && error && renderFallback()}
    </div>
  );
};

export default OptimizedImage;
