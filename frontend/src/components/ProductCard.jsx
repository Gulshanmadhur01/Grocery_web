import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Heart, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(AppContext);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className={`card ${styles.cardWrapper} animate-fade-in`}>
      {/* Wishlist Heart Icon (Top Right) */}
      <button 
        onClick={handleWishlistToggle} 
        className={styles.wishlistBtn}
        title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <Heart 
          size={16} 
          className={isWishlisted ? styles.heartFilled : styles.heartOutline} 
          fill={isWishlisted ? "var(--danger)" : "none"} 
        />
      </button>

      {/* Product Image Link */}
      <Link to={`/product/${product.id}`} className={styles.imageLink}>
        <img 
          src={product.image || '/assets/images/placeholder.svg'} 
          alt={product.name} 
          className={styles.productImage} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/images/placeholder.svg';
          }}
        />
      </Link>

      <div className={styles.details}>
        {/* Title */}
        <h3 className={styles.title}>
          <Link to={`/product/${product.id}`}>{product.name} ({product.unit})</Link>
        </h3>

        {/* Pricing and Action */}
        <div className={styles.pricing}>
          <span className={styles.price}>₹{product.price.toFixed(0)}</span>
        </div>

        <button 
          onClick={() => addToCart(product, 1)}
          disabled={isOutOfStock}
          className={`${styles.addBtn} ${isOutOfStock ? styles.outOfStockBtn : ''}`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
