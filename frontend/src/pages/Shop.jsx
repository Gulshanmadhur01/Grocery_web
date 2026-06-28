import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { LayoutGrid, List, SlidersHorizontal, ChevronRight, X } from 'lucide-react';
import styles from './Shop.module.css';

const Shop = () => {
  const { 
    products, 
    categories, 
    loading, 
    activeCategory, 
    setActiveCategory, 
    activeSort, 
    setActiveSort,
    searchQuery,
    setSearchQuery
  } = useContext(AppContext);

  const location = useLocation();

  // Price range slider state (₹0 to ₹500)
  const [priceRange, setPriceRange] = useState(500);
  const [selectedBrands, setSelectedBrands] = useState(['all']);
  const [dietaryPrefs, setDietaryPrefs] = useState([]);

  // Handle category query parameter if passed in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveCategory(catParam);
    }
  }, [location.search]);

  const handleCategorySelect = (slug) => {
    setActiveCategory(slug);
  };

  const handleSortSelect = (e) => {
    setActiveSort(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPriceRange(Number(e.target.value));
  };

  const handleBrandChange = (brand) => {
    if (brand === 'all') {
      setSelectedBrands(['all']);
    } else {
      let updated = selectedBrands.filter(b => b !== 'all');
      if (updated.includes(brand)) {
        updated = updated.filter(b => b !== brand);
        if (updated.length === 0) updated = ['all'];
      } else {
        updated.push(brand);
      }
      setSelectedBrands(updated);
    }
  };

  const handleDietaryChange = (pref) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter(p => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const handleClearFilters = () => {
    setActiveCategory('all');
    setActiveSort('');
    setSearchQuery('');
    setPriceRange(500);
    setSelectedBrands(['all']);
    setDietaryPrefs([]);
  };

  // Filter products locally for simulated Price Range & Brands filters
  const filteredProducts = products.filter(product => {
    // 1. Price check
    if (product.price > priceRange) return false;
    
    // 2. Brand check simulation
    if (!selectedBrands.includes('all')) {
      // Simulate assigning mock brands based on ID for filter demonstration
      const mockBrands = ['Organic India', '24 Mantra', 'BB Royal', 'Other Brands'];
      const productBrand = mockBrands[product.name.length % mockBrands.length];
      if (!selectedBrands.includes(productBrand)) return false;
    }

    // 3. Dietary check simulation
    if (dietaryPrefs.length > 0) {
      // Simulate assigning mock dietary profile
      const productPrefs = [];
      if (product.name.toLowerCase().includes('organic')) productPrefs.push('Organic');
      if (product.category === 'fruits-vegetables') productPrefs.push('Vegan');
      if (product.category === 'beverages') productPrefs.push('Sugar Free');
      
      const matchAll = dietaryPrefs.every(pref => productPrefs.includes(pref));
      if (!matchAll) return false;
    }

    return true;
  });

  const activeCategoryDetails = categories.find(c => c.slug === activeCategory) || {
    name: 'All Groceries',
    slug: 'all',
    image: '/assets/images/fresh_groceries_basket.png'
  };

  return (
    <div className="container animate-fade-in">
      {/* 1. Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" onClick={handleClearFilters}>Shop</Link>
        {activeCategory !== 'all' && (
          <>
            <ChevronRight size={12} />
            <span className={styles.breadcrumbActive}>{activeCategoryDetails.name}</span>
          </>
        )}
      </nav>

      {/* 2. Top Header Banner Block */}
      <div className={styles.categoryBanner}>
        <div className={styles.bannerContent}>
          <h1>{activeCategoryDetails.name}</h1>
          <p>Handpicked farm fresh produce for you</p>
        </div>
        <div className={styles.bannerImageColumn}>
          <img 
            src="/assets/images/fresh_groceries_basket.png" 
            alt="Basket" 
            className={styles.bannerImage} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/images/placeholder.svg';
            }}
          />
        </div>
      </div>

      {/* 3. Main Split Catalog Layout */}
      <div className={styles.layout}>
        {/* Left Columns: Categories & Filters Sidebar */}
        <aside className={styles.sidebar}>
          {/* Categories Card */}
          <div className={`${styles.sidebarCard} card`}>
            <h3 className={styles.sidebarCardTitle}>Categories</h3>
            <div className={styles.categoryList}>
              <button 
                className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.activeCategory : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  className={`${styles.categoryBtn} ${activeCategory === cat.slug ? styles.activeCategory : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Card */}
          <div className={`${styles.sidebarCard} card`}>
            <div className={styles.filterCardHeader}>
              <h3 className={styles.sidebarCardTitle}>Filters</h3>
              {(activeCategory !== 'all' || activeSort !== '' || searchQuery !== '' || priceRange !== 500 || !selectedBrands.includes('all') || dietaryPrefs.length > 0) && (
                <button onClick={handleClearFilters} className={styles.clearLink}>
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range Slider */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>Price Range</h4>
              <div className={styles.priceSliderWrapper}>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  value={priceRange} 
                  onChange={handlePriceChange}
                  className={styles.priceSlider} 
                />
                <div className={styles.priceLabels}>
                  <span>₹0</span>
                  <span>₹{priceRange}</span>
                </div>
              </div>
            </div>

            {/* Brand checkboxes */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>Brand</h4>
              <div className={styles.checkboxList}>
                <label className={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={selectedBrands.includes('all')} 
                    onChange={() => handleBrandChange('all')}
                  />
                  <span>All Brands</span>
                </label>
                {['Organic India', '24 Mantra', 'BB Royal', 'Other Brands'].map(brand => (
                  <label key={brand} className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand)} 
                      onChange={() => handleBrandChange(brand)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary preferences checkboxes */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>Dietary Preference</h4>
              <div className={styles.checkboxList}>
                {['Organic', 'Gluten Free', 'Vegan', 'Sugar Free'].map(pref => (
                  <label key={pref} className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={dietaryPrefs.includes(pref)} 
                      onChange={() => handleDietaryChange(pref)}
                    />
                    <span>{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleClearFilters} className={`btn btn-primary ${styles.applyBtn}`}>
              Apply Filters
            </button>
            
            <button onClick={handleClearFilters} className={styles.clearBtnMobile}>
              Clear All
            </button>
          </div>
        </aside>

        {/* Right Columns: Catalog Display */}
        <main className={styles.catalog}>
          {/* Header Row */}
          <div className={styles.catalogHeader}>
            <div className={styles.itemsFoundCount}>
              {filteredProducts.length} Items Found
            </div>

            {searchQuery && (
              <div className={styles.searchQueryBadge}>
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}><X size={12} /></button>
              </div>
            )}

            <div className={styles.catalogControls}>
              <div className={styles.sortWrapper}>
                <SlidersHorizontal size={14} className={styles.sortIcon} />
                <select value={activeSort} onChange={handleSortSelect} className={styles.sortSelect}>
                  <option value="">Sort by: Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Average Rating</option>
                </select>
              </div>
              <div className={styles.gridToggle}>
                <button className={`${styles.toggleBtn} ${styles.toggleBtnActive}`}><LayoutGrid size={16} /></button>
                <button className={styles.toggleBtn}><List size={16} /></button>
              </div>
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className={styles.loadingSpinner}>Loading fresh stocks...</div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No products found</h3>
              <p>Try resetting filters or adjusting the price range slider to find products.</p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className={styles.pagination}>
              <button className={`${styles.pageItem} ${styles.pageItemActive}`}>1</button>
              <button className={styles.pageItem}>2</button>
              <button className={styles.pageItem}>3</button>
              <span className={styles.pageDots}>...</span>
              <button className={styles.pageItem}>10</button>
              <button className={styles.pageNextBtn}>Next</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
