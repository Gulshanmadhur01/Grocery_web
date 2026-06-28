import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    const qty = Math.max(1, Math.min(val, product.stock));
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return <div className={`${styles.loading} container`}>Loading fresh details...</div>;
  }

  if (error || !product) {
    return (
      <div className={`${styles.notFound} container`}>
        <h2>Product Not Found</h2>
        <p>The grocery item you're looking for might be out of stock or removed.</p>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="container animate-fade-in">
      {/* Back Link */}
      <div className={styles.backWrapper}>
        <Link to="/shop" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      {/* Details Grid Layout */}
      <div className={styles.detailGrid}>
        {/* Left Column: Image Card */}
        <div className={styles.imageColumn}>
          <div className={styles.imageCard}>
            <img 
              src={product.image || '/assets/images/placeholder.svg'} 
              alt={product.name} 
              className={styles.image} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/images/placeholder.svg';
              }}
            />
            {isOutOfStock && <span className={styles.outOfStockBadge}>Out of Stock</span>}
          </div>
        </div>

        {/* Right Column: Info */}
        <div className={styles.infoColumn}>
          <span className={styles.categoryBadge}>{product.category.replace('-', ' ')}</span>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.unit}>{product.unit} size</p>

          {/* Rating */}
          <div className={styles.rating}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={i < Math.floor(product.rating) ? styles.starFull : styles.starEmpty} 
                  fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className={styles.ratingText}>
              <strong>{product.rating}</strong> ({product.reviewsCount} verified reviews)
            </span>
          </div>

          <div className={styles.priceContainer}>
            <span className={styles.price}>₹{product.price.toFixed(2)}</span>
            <span className={styles.taxText}>Inclusive of all local taxes</span>
          </div>

          <p className={styles.description}>{product.description}</p>

          {/* Cart Quantity Action Block */}
          {!isOutOfStock && (
            <div className={styles.actionBlock}>
              <div className={styles.qtyLabel}>Quantity:</div>
              <div className={styles.qtySelector}>
                <button onClick={() => handleQtyChange(quantity - 1)} className={styles.qtyBtn}>-</button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button onClick={() => handleQtyChange(quantity + 1)} className={styles.qtyBtn}>+</button>
              </div>
              <span className={styles.stockStatus}>Only {product.stock} items left!</span>
            </div>
          )}

          <div className={styles.checkoutActions}>
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn btn-primary ${styles.addToCartBtn} ${isOutOfStock ? styles.disabledBtn : ''}`}
            >
              <ShoppingCart size={18} />
              {isOutOfStock ? 'Currently Out of Stock' : 'Add to Shopping Cart'}
            </button>
          </div>

          <hr className={styles.divider} />

          {/* Trust Value Badges */}
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <Truck size={20} className={styles.trustIcon} />
              <div>
                <strong>Express Delivery</strong>
                <span>Guaranteed within 2 hours</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <RefreshCw size={20} className={styles.trustIcon} />
              <div>
                <strong>Easy Return Policy</strong>
                <span>Hassle-free return on delivery</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={20} className={styles.trustIcon} />
              <div>
                <strong>100% Organic Fresh</strong>
                <span>Directly from organic certified farm partners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
