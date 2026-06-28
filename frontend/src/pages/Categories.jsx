import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import OptimizedImage from '../components/OptimizedImage';
import { ChevronRight, X, SlidersHorizontal } from 'lucide-react';
import styles from './Categories.module.css';

const Categories = () => {
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

  // Price range and filter states
  const [priceRange, setPriceRange] = useState(500);
  const [selectedBrands, setSelectedBrands] = useState(['all']);

  // Sync category query parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveCategory(catParam);
    }
  }, [location.search, setActiveCategory]);

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

  const handleClearFilters = () => {
    setActiveCategory('all');
    setActiveSort('');
    setSearchQuery('');
    setPriceRange(500);
    setSelectedBrands(['all']);
  };

  // Filter products by Price, Category, and Brand locally
  const filteredProducts = products.filter(product => {
    // 1. Price check
    if (product.price > priceRange) return false;
    
    // 2. Brand check simulation
    if (!selectedBrands.includes('all')) {
      const mockBrands = ['Organic India', '24 Mantra', 'BB Royal', 'Other Brands'];
      const productBrand = mockBrands[product.name.length % mockBrands.length];
      if (!selectedBrands.includes(productBrand)) return false;
    }

    return true;
  });

  const activeCategoryDetails = categories.find(c => c.slug === activeCategory) || {
    name: 'All Categories',
    slug: 'all',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
  };

  return (
    <div className={`${styles.categoriesWrapper} container animate-fade-in`}>
      {/* 1. Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/categories" onClick={handleClearFilters}>Categories</Link>
        {activeCategory !== 'all' && (
          <>
            <ChevronRight size={12} />
            <span className={styles.breadcrumbActive}>{activeCategoryDetails.name}</span>
          </>
        )}
      </nav>

      {/* 2. Top Header Banner with Optimized Image */}
      <div className={styles.categoryBanner}>
        <div className={styles.bannerContent}>
          <span className={styles.bannerTagline}>⚡ Farm to Home In Minutes</span>
          <h1>{activeCategoryDetails.name}</h1>
          <p>Get premium quality items curated specially for you.</p>
        </div>
        <div className={styles.bannerImageColumn}>
          <OptimizedImage
            src={activeCategoryDetails.image}
            alt={activeCategoryDetails.name}
            fallbackType="banner"
            aspectRatio="16/7"
            objectFit="cover"
          />
        </div>
      </div>

      {/* 3. Catalog Layout */}
      <div className={styles.catalogLayout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar}>
          {/* Categories List */}
          <div className={`${styles.sidebarCard} card`}>
            <h3 className={styles.sidebarCardTitle}>Browse Categories</h3>
            <div className={styles.categoryList}>
              <button 
                className={`${styles.categoryBtn} ${activeCategory === 'all' ? styles.activeCategory : ''}`}
                onClick={() => handleCategorySelect('all')}
              >
                <div className={styles.catIconDummy}>🏷️</div>
                <span>All Products</span>
              </button>
              
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  className={`${styles.categoryBtn} ${activeCategory === cat.slug ? styles.activeCategory : ''}`}
                  onClick={() => handleCategorySelect(cat.slug)}
                >
                  <div className={styles.catImageWrapper}>
                    <OptimizedImage
                      src={cat.image}
                      alt={cat.name}
                      fallbackType="category"
                      aspectRatio="1/1"
                    />
                  </div>
                  <span className={styles.catBtnName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Brands Filters Card */}
          <div className={`${styles.sidebarCard} card`}>
            <div className={styles.filterCardHeader}>
              <h3 className={styles.sidebarCardTitle}>Refine Results</h3>
              {(activeCategory !== 'all' || activeSort !== '' || searchQuery !== '' || priceRange !== 500 || !selectedBrands.includes('all')) && (
                <button onClick={handleClearFilters} className={styles.clearLink}>
                  Clear All
                </button>
              )}
            </div>

            {/* Price Slider */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>Max Price: ₹{priceRange}</h4>
              <input 
                type="range" 
                min="10" 
                max="1000" 
                value={priceRange} 
                onChange={handlePriceChange}
                className={styles.priceSlider} 
              />
              <div className={styles.priceLabels}>
                <span>₹10</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Brands Checkboxes */}
            <div className={styles.filterSection}>
              <h4 className={styles.filterSectionTitle}>Select Brand</h4>
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
          </div>
        </aside>

        {/* Right Catalog Feed */}
        <main className={styles.catalogFeed}>
          {/* Controls Header */}
          <div className={styles.feedHeader}>
            <div className={styles.itemsCount}>
              <strong>{filteredProducts.length}</strong> items found
            </div>

            {searchQuery && (
              <div className={styles.searchQueryBadge}>
                <span>Search: "{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')}><X size={12} /></button>
              </div>
            )}

            <div className={styles.feedSort}>
              <SlidersHorizontal size={14} className={styles.sortIcon} />
              <select value={activeSort} onChange={handleSortSelect} className={styles.sortSelect}>
                <option value="">Sort by: Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Feed Grid or Loading Skeletons */}
          {loading ? (
            <div className={styles.skeletonGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonLineLong} />
                  <div className={styles.skeletonButton} />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.emptyFeed}>
              <h3>No items match your filters</h3>
              <p>Try resetting the search keywords or broadening your price threshold.</p>
              <button onClick={handleClearFilters} className="btn btn-primary">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Categories;
