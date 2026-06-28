import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Plus, Trash2, Edit2, 
  ShoppingBag, DollarSign, Users, ClipboardList, CheckCircle, Package, RefreshCw, Upload
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const { 
    user, token, 
    products, categories, 
    orders, fetchOrders, updateOrderStatus,
    createProduct, updateProduct, deleteProduct, fetchAdminStats,
    createCategory, updateCategory, deleteCategory, uploadImage
  } = useContext(AppContext);

  // Guards
  if (!user || user.role !== 'admin') {
    return (
      <div className={`${styles.denied} container animate-fade-in`}>
        <ShieldAlert size={64} className={styles.deniedIcon} />
        <h2>Access Denied</h2>
        <p>You must be signed in as an administrator to view this control panel.</p>
        <Link to="/profile" className="btn btn-primary">Login As Admin</Link>
      </div>
    );
  }

  // Admin section states: 'stats', 'products', 'categories', 'orders'
  const [activeTab, setActiveTab] = useState('stats');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });

  // Modal / Form fields for Add & Edit Product
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: 'fruits-vegetables',
    image: '',
    stock: '',
    featured: false
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    icon: 'Apple',
    image: ''
  });
  const [catFormError, setCatFormError] = useState('');
  const [catFormSuccess, setCatFormSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Image File Upload handler
  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    if (type === 'product') {
      setFormError('');
    } else {
      setCatFormError('');
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      const res = await uploadImage(file.name, file.type, base64Data);
      setUploading(false);
      if (res.success) {
        if (type === 'product') {
          setProductFormData(prev => ({ ...prev, image: res.url }));
        } else {
          setCategoryFormData(prev => ({ ...prev, image: res.url }));
        }
      } else {
        if (type === 'product') {
          setFormError(`Image upload failed: ${res.message}`);
        } else {
          setCatFormError(`Image upload failed: ${res.message}`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCatFormError('');
    setCatFormSuccess('');

    if (!categoryFormData.name || !categoryFormData.slug) {
      setCatFormError('Category Name and Slug are required');
      return;
    }

    let result;
    if (editingCategoryId) {
      result = await updateCategory(editingCategoryId, categoryFormData);
    } else {
      result = await createCategory(categoryFormData);
    }

    if (result.success) {
      setCatFormSuccess(editingCategoryId ? 'Category updated successfully' : 'Category created successfully');
      setShowCategoryForm(false);
      resetCategoryForm();
    } else {
      setCatFormError(result.message || 'Action failed');
    }
  };

  const handleCatEditClick = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryFormData({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || 'Apple',
      image: cat.image || ''
    });
    setShowCategoryForm(true);
  };

  const handleCatDeleteClick = async (catId) => {
    if (window.confirm('Are you sure you want to delete this category? All products under this category will remain, but the category structure will be removed.')) {
      const result = await deleteCategory(catId);
      if (!result.success) {
        alert(`Delete failed: ${result.message}`);
      }
    }
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryFormData({
      name: '',
      slug: '',
      icon: 'Apple',
      image: ''
    });
    setCatFormError('');
  };

  // Load Admin Stats & Sync Orders
  const loadStats = async () => {
    const data = await fetchAdminStats();
    if (data) {
      setStats(data);
    }
  };

  useEffect(() => {
    loadStats();
    fetchOrders();
  }, [activeTab, products]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Validations
    if (!productFormData.name || !productFormData.price || !productFormData.unit || !productFormData.stock) {
      setFormError('Name, price, unit size, and stock level are required');
      return;
    }

    const payload = {
      ...productFormData,
      price: parseFloat(productFormData.price),
      stock: parseInt(productFormData.stock)
    };

    let result;
    if (editingProductId) {
      result = await updateProduct(editingProductId, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result.success) {
      setFormSuccess(editingProductId ? 'Product updated successfully' : 'Product created successfully');
      setShowProductForm(false);
      resetProductForm();
      loadStats();
    } else {
      setFormError(result.message || 'Action failed');
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setProductFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      unit: product.unit,
      category: product.category,
      image: product.image,
      stock: product.stock.toString(),
      featured: product.featured || false
    });
    setShowProductForm(true);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(productId);
      if (result.success) {
        loadStats();
      } else {
        alert(`Delete failed: ${result.message}`);
      }
    }
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      unit: '',
      category: 'fruits-vegetables',
      image: '',
      stock: '',
      featured: false
    });
    setFormError('');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await updateOrderStatus(orderId, newStatus);
    if (res.success) {
      loadStats();
    } else {
      alert(`Status update failed: ${res.message}`);
    }
  };

  return (
    <div className="container animate-fade-in">
      {/* Page Title */}
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <LayoutDashboard size={28} className={styles.titleIcon} />
          <div>
            <h1 className={styles.title}>Admin Control Center</h1>
            <p className={styles.subtitle}>Manage catalog inventory, check sales, and dispatch orders.</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.tabs}>
        <button 
          onClick={() => setActiveTab('stats')} 
          className={`${styles.tabBtn} ${activeTab === 'stats' ? styles.activeTab : ''}`}
        >
          Overview Statistics
        </button>
        <button 
          onClick={() => setActiveTab('products')} 
          className={`${styles.tabBtn} ${activeTab === 'products' ? styles.activeTab : ''}`}
        >
          Product Catalog
        </button>
        <button 
          onClick={() => setActiveTab('categories')} 
          className={`${styles.tabBtn} ${activeTab === 'categories' ? styles.activeTab : ''}`}
        >
          Category Management
        </button>
        <button 
          onClick={() => setActiveTab('orders')} 
          className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.activeTab : ''}`}
        >
          Order Dispatch Desk
        </button>
      </div>

      {/* TAB CONTENT: Stats Dashboard */}
      {activeTab === 'stats' && (
        <div className={styles.tabContent}>
          <div className={styles.statsGrid}>
            <div className={`${styles.statsCard} card`}>
              <div className={`${styles.statsIcon} ${styles.revenue}`}>
                <DollarSign size={24} />
              </div>
              <div className={styles.statsData}>
                <span>Total Revenue</span>
                 <h2>₹{stats.totalRevenue.toFixed(2)}</h2>
              </div>
            </div>

            <div className={`${styles.statsCard} card`}>
              <div className={`${styles.statsIcon} ${styles.orders}`}>
                <ClipboardList size={24} />
              </div>
              <div className={styles.statsData}>
                <span>Total Orders</span>
                <h2>{stats.totalOrders}</h2>
              </div>
            </div>

            <div className={`${styles.statsCard} card`}>
              <div className={`${styles.statsIcon} ${styles.products}`}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.statsData}>
                <span>Total Items</span>
                <h2>{stats.totalProducts}</h2>
              </div>
            </div>

            <div className={`${styles.statsCard} card`}>
              <div className={`${styles.statsIcon} ${styles.users}`}>
                <Users size={24} />
              </div>
              <div className={styles.statsData}>
                <span>Registered Users</span>
                <h2>{stats.totalUsers}</h2>
              </div>
            </div>
          </div>

          <div className={`${styles.statsOverviewCard} card`}>
            <h3>Delivery Dispatch Queue Summary</h3>
            <hr className={styles.divider} />
            <div className={styles.queueStats}>
              <div className={styles.queueItem}>
                <strong>{stats.pendingOrders}</strong>
                <span>Pending Dispatch</span>
              </div>
              <div className={styles.queueItem}>
                <strong>{stats.totalOrders - stats.pendingOrders}</strong>
                <span>Completed Deliveries</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Catalog Management */}
      {activeTab === 'products' && (
        <div className={styles.tabContent}>
          <div className={styles.contentHeader}>
            <h3>Manage Products</h3>
            <button 
              onClick={() => { resetProductForm(); setShowProductForm(true); }} 
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Product
            </button>
          </div>

          {/* Add / Edit Form Modal-Overlay */}
          {showProductForm && (
            <div className={`${styles.formModal} card`}>
              <h4>{editingProductId ? 'Edit Product details' : 'Add New Product'}</h4>
              <hr className={styles.divider} />
              
              {formError && <div className={styles.formError}>{formError}</div>}
              {formSuccess && <div className={styles.formSuccess}>{formSuccess}</div>}

              <form onSubmit={handleProductSubmit} className={styles.productFormGrid}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={productFormData.name} 
                    onChange={handleInputChange} 
                    className="form-control"
                    placeholder="e.g. Organic Red Apples"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="price" 
                      value={productFormData.price} 
                      onChange={handleInputChange} 
                      className="form-control"
                      placeholder="e.g. 120"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit Size *</label>
                    <input 
                      type="text" 
                      name="unit" 
                      value={productFormData.unit} 
                      onChange={handleInputChange} 
                      className="form-control"
                      placeholder="e.g. 1 kg or 500g"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select 
                      name="category" 
                      value={productFormData.category} 
                      onChange={handleInputChange} 
                      className="form-control"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Inventory *</label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={productFormData.stock} 
                      onChange={handleInputChange} 
                      className="form-control"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Product Image</label>
                  <div className={styles.imageUploadWrapper}>
                    <input 
                      type="text" 
                      name="image" 
                      value={productFormData.image} 
                      onChange={handleInputChange} 
                      className="form-control"
                      placeholder="Unsplash URL or upload local image"
                    />
                    <div className={styles.fileUploadBtn}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="product-file-upload" 
                        onChange={(e) => handleFileUpload(e, 'product')} 
                        className={styles.fileInput}
                      />
                      <label htmlFor="product-file-upload" className={styles.fileLabel}>
                        <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                      </label>
                    </div>
                  </div>
                  {productFormData.image && (
                    <div className={styles.imagePreview}>
                      <img 
                        src={productFormData.image} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    name="description" 
                    value={productFormData.description} 
                    onChange={handleInputChange} 
                    className="form-control"
                    placeholder="Detailed item features and highlights..."
                    rows="3"
                  ></textarea>
                </div>

                <div className={`${styles.checkboxGroup} form-group`}>
                  <input 
                    type="checkbox" 
                    name="featured" 
                    id="featured" 
                    checked={productFormData.featured} 
                    onChange={handleInputChange}
                  />
                  <label htmlFor="featured">Feature this product on Homepage carousel</label>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className="btn btn-primary">
                    {editingProductId ? 'Update Product' : 'Add Product'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowProductForm(false); resetProductForm(); }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Listing Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.tableProductCell}>
                        <img 
                          src={product.image || '/assets/images/placeholder.svg'} 
                          alt={product.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/placeholder.svg';
                          }}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <span>{product.unit}</span>
                        </div>
                      </div>
                    </td>
                    <td>{product.category.replace('-', ' ')}</td>
                     <td><strong>₹{product.price.toFixed(2)}</strong></td>
                    <td>
                      <span className={product.stock > 10 ? styles.stockGood : styles.stockLow}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        <button onClick={() => handleEditClick(product)} className={styles.editBtn} title="Edit Product">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(product.id)} className={styles.deleteBtn} title="Delete Product">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Dispatch Queue Orders */}
      {activeTab === 'orders' && (
        <div className={styles.tabContent}>
          <div className={styles.contentHeader}>
            <h3>Dispatcher desk</h3>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Items Ordered</th>
                  <th>Total Amount</th>
                  <th>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className={styles.orderIdCell}>
                        <strong>Order #{order.id.slice(-6)}</strong>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <strong>{order.userName}</strong>
                        <span>{order.userEmail}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.itemsSummary}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.summaryItemLine}>
                            {item.name} <strong>x{item.quantity}</strong>
                          </div>
                        ))}
                      </div>
                    </td>
                     <td><strong>₹{order.total.toFixed(2)}</strong></td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`${styles.statusSelect} ${styles[order.status.replace(/\s+/g, '')]}`}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Category Management */}
      {activeTab === 'categories' && (
        <div className={styles.tabContent}>
          <div className={styles.contentHeader}>
            <h3>Manage Categories</h3>
            <button 
              onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }} 
              className="btn btn-primary"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>

          {/* Add / Edit Form Modal-Overlay */}
          {showCategoryForm && (
            <div className={`${styles.formModal} card`}>
              <h4>{editingCategoryId ? 'Edit Category details' : 'Add New Category'}</h4>
              <hr className={styles.divider} />
              
              {catFormError && <div className={styles.formError}>{catFormError}</div>}
              {catFormSuccess && <div className={styles.formSuccess}>{catFormSuccess}</div>}

              <form onSubmit={handleCategorySubmit} className={styles.productFormGrid}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={categoryFormData.name} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategoryFormData(prev => ({
                        ...prev,
                        name: val,
                        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                      }));
                    }} 
                    className="form-control"
                    placeholder="e.g. Organic Produce"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Slug *</label>
                  <input 
                    type="text" 
                    name="slug" 
                    value={categoryFormData.slug} 
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))} 
                    className="form-control"
                    placeholder="e.g. organic-produce"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Image</label>
                  <div className={styles.imageUploadWrapper}>
                    <input 
                      type="text" 
                      name="image" 
                      value={categoryFormData.image} 
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, image: e.target.value }))} 
                      className="form-control"
                      placeholder="Unsplash URL or upload local image"
                    />
                    <div className={styles.fileUploadBtn}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        id="category-file-upload" 
                        onChange={(e) => handleFileUpload(e, 'category')} 
                        className={styles.fileInput}
                      />
                      <label htmlFor="category-file-upload" className={styles.fileLabel}>
                        <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
                      </label>
                    </div>
                  </div>
                  {categoryFormData.image && (
                    <div className={styles.imagePreview}>
                      <img 
                        src={categoryFormData.image} 
                        alt="Preview" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Icon Name</label>
                  <input 
                    type="text" 
                    name="icon" 
                    value={categoryFormData.icon} 
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, icon: e.target.value }))} 
                    className="form-control"
                    placeholder="e.g. Apple, Cookie, Heart"
                  />
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className="btn btn-primary">
                    {editingCategoryId ? 'Update Category' : 'Add Category'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setShowCategoryForm(false); resetCategoryForm(); }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Categories Listing Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Category Image</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Icon</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className={styles.tableProductCell}>
                        <img 
                          src={cat.image || '/assets/images/placeholder.svg'} 
                          alt={cat.name} 
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/placeholder.svg';
                          }}
                        />
                      </div>
                    </td>
                    <td><strong>{cat.name}</strong></td>
                    <td><code>{cat.slug}</code></td>
                    <td>{cat.icon}</td>
                    <td>
                      <div className={styles.tableActions}>
                        <button onClick={() => handleCatEditClick(cat)} className={styles.editBtn} title="Edit Category">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleCatDeleteClick(cat.id)} className={styles.deleteBtn} title="Delete Category">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
