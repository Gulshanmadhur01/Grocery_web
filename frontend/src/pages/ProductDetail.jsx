import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import OptimizedImage from '../components/OptimizedImage';
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, products } = useContext(AppContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedItems, setRelatedItems] = useState([]);

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

  useEffect(() => {
    if (product && products.length > 0) {
      // Find related products in same category, exclude current
      const filtered = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);
      setRelatedItems(filtered);
    }
  }, [product, products]);

  const handleQtyChange = (val) => {
    const qty = Math.max(1, Math.min(val, product.stock));
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return <div className={`${styles.loading} container`}>Loading fresh details...</div>;
  }

  if (error || !product) {
    return (
      <div className={`${styles.notFound} container`}>
        <h2>Product Not Found</h2>
        <p>The grocery item you're looking for might be out of stock or removed.</p>
        <Link to="/categories" className="btn btn-primary">Back to Categories</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  // Simulated Nutritional Facts depending on Category
  const getNutritionFacts = () => {
    const cat = product.category;
    if (cat === 'fruits-vegetables') {
      return { cal: '45 kcal', fat: '0.1g', carbs: '11g', fiber: '2.4g', protein: '0.8g' };
    } else if (cat === 'dairy-eggs') {
      return { cal: '146 kcal', fat: '8g', carbs: '4.8g', fiber: '0g', protein: '8g' };
    } else if (cat === 'bakery' || cat === 'snacks') {
      return { cal: '290 kcal', fat: '14g', carbs: '42g', fiber: '1.8g', protein: '4.5g' };
    } else if (cat === 'sweet-tooth') {
      return { cal: '340 kcal', fat: '16g', carbs: '48g', fiber: '0.5g', protein: '3.8g' };
    }
    return { cal: '120 kcal', fat: '3.5g', carbs: '18g', fiber: '1.2g', protein: '2.5g' };
  };

  const nutrition = getNutritionFacts();

  return (
    <div className="container animate-fade-in">
      {/* Back Link */}
      <div className={styles.backWrapper}>
        <Link to="/categories" className={styles.backLink}>
          <ArrowLeft size={16} /> Back to Categories
        </Link>
      </div>

      {/* Details Grid Layout */}
      <div className={styles.detailGrid}>
        {/* Left Column: Image Card */}
        <div className={styles.imageColumn}>
          <div className={styles.imageCard}>
            <OptimizedImage
              src={product.image}
              alt={product.name}
              fallbackType="product"
              aspectRatio="1/1"
              objectFit="cover"
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
            <div className={styles.deliveryIndicator}>
              ⚡ Get it in <strong style={{ color: 'var(--success)' }}>12 mins</strong>
            </div>
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
              {isOutOfStock ? 'Currently Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <hr className={styles.divider} />

          {/* Trust Value Badges */}
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <Truck size={20} className={styles.trustIcon} />
              <div>
                <strong>Instant Express</strong>
                <span>Guaranteed fast doorstep drop</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <RefreshCw size={20} className={styles.trustIcon} />
              <div>
                <strong>Easy Returns</strong>
                <span>Instant return/refund on delivery</span>
              </div>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={20} className={styles.trustIcon} />
              <div>
                <strong>100% Quality Checked</strong>
                <span>Sourced directly from certified partners</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className={styles.tabsSection}>
        <div className={styles.tabsHeader}>
          <button 
            onClick={() => setActiveTab('description')} 
            className={`${styles.tabBtn} ${activeTab === 'description' ? styles.activeTab : ''}`}
          >
            Product Overview
          </button>
          <button 
            onClick={() => setActiveTab('nutrition')} 
            className={`${styles.tabBtn} ${activeTab === 'nutrition' ? styles.activeTab : ''}`}
          >
            Nutritional Facts
          </button>
          <button 
            onClick={() => setActiveTab('reviews')} 
            className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
          >
            Customer Reviews
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <div className={styles.tabPane}>
              <h3>Product Description</h3>
              <p>{product.description}</p>
              <p style={{ marginTop: '1rem' }}>
                All our items are packaged with food-safe material and handled in clean, sanitized conditions. Store in a cool, dry place to maintain shelf-life.
              </p>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className={styles.tabPane}>
              <h3>Nutritional Details (Approx per 100g)</h3>
              <table className={styles.nutritionTable}>
                <tbody>
                  <tr>
                    <td><strong>Energy</strong></td>
                    <td>{nutrition.cal}</td>
                  </tr>
                  <tr>
                    <td><strong>Total Fat</strong></td>
                    <td>{nutrition.fat}</td>
                  </tr>
                  <tr>
                    <td><strong>Carbohydrates</strong></td>
                    <td>{nutrition.carbs}</td>
                  </tr>
                  <tr>
                    <td><strong>Dietary Fiber</strong></td>
                    <td>{nutrition.fiber}</td>
                  </tr>
                  <tr>
                    <td><strong>Proteins</strong></td>
                    <td>{nutrition.protein}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.tabPane}>
              <h3>Customer Reviews ({product.reviewsCount})</h3>
              <div className={styles.reviewsList}>
                <div className={styles.reviewItem}>
                  <div className={styles.reviewStars}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="var(--secondary)" color="var(--secondary)" />)}
                  </div>
                  <strong>Perfect Quality!</strong>
                  <p>Extremely fresh and delivered in less than 10 mins. Very impressed with the speed!</p>
                  <span>- Rajesh Kumar (Verified Buyer)</span>
                </div>
                
                <div className={styles.reviewItem}>
                  <div className={styles.reviewStars}>
                    {[...Array(4)].map((_, i) => <Star key={i} size={12} fill="var(--secondary)" color="var(--secondary)" />)}
                  </div>
                  <strong>Value for money</strong>
                  <p>Clean packaging, good weight. Will definitely purchase again next week.</p>
                  <span>- Seema Rao (Verified Buyer)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedItems.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <Sparkles size={18} className={styles.relatedIcon} />
            <h2>You Might Also Like</h2>
          </div>
          <div className={styles.relatedGrid}>
            {relatedItems.map(item => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

