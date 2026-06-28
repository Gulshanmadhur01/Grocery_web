import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  // Theme state initialized to system default
  const [theme, setTheme] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // User auth state
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
      return null;
    }
  });

  // Global app states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      return [];
    }
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Delivery Location States (Blinkit-style)
  const [deliveryLocation, setDeliveryLocationState] = useState(() => {
    return localStorage.getItem('deliveryLocation') || '';
  });
  const [showLocationModal, setShowLocationModal] = useState(() => {
    return !localStorage.getItem('deliveryLocation');
  });
  
  // Cart Side-Drawer Toggle State
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);


  const setDeliveryLocation = (loc) => {
    setDeliveryLocationState(loc);
    localStorage.setItem('deliveryLocation', loc);
  };

  // Search & Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('');

  // Handle HTML document theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen to system preference changes dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch initial app data (products & categories)
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [activeCategory, searchQuery, activeSort]);

  // Sync user orders when logged in
  useEffect(() => {
    if (token) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [token]);



  // API Call: Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/products?category=${activeCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (activeSort) url += `&sort=${activeSort}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // API Call: Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Categories error:', err.message);
    }
  };

  // Auth: Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Auth: Register
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Auth: Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCart([]);
  };

  // Cart: Add to Cart
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        // Limit quantity to available stock
        const newQty = Math.min(existingItem.quantity + quantity, product.stock);
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prevCart, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
    // Open the premium cart drawer automatically for quick check/actions
    setCartDrawerOpen(true);
  };


  // Cart: Remove from Cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Cart: Update Quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  // Cart: Clear Cart
  const clearCart = () => {
    setCart([]);
  };

  // API Call: Place Order
  const placeOrder = async (shippingAddress, paymentMethod = 'Card') => {
    if (!token) return { success: false, message: 'Must be logged in to order' };
    
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: orderItems, shippingAddress, paymentMethod })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Order failed');
      
      clearCart();
      await fetchOrders();
      await fetchProducts(); // Refresh stock counts in UI
      return { success: true, order: data.order };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // API Call: Fetch Orders
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Fetch orders error:', err.message);
    }
  };

  // API Call: Update Order Status (Admin only)
  const updateOrderStatus = async (orderId, status) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      await fetchOrders();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // API Call: Manage Catalog (Admin CRUD)
  const createProduct = async (productData) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateProduct = async (productId, productData) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteProduct = async (productId) => {
    if (!token) return { success: false };
    try {
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchProducts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // API Call: Category CRUD & Image Upload
  const uploadImage = async (name, type, base64Data) => {
    if (!token) return { success: false, message: 'Must be logged in as admin to upload images' };
    try {
      const res = await fetch(`${API_BASE_URL}/products/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, type, data: base64Data })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      return { success: true, url: data.url };
    } catch (err) {
      console.error('Image upload error:', err.message);
      return { success: false, message: err.message };
    }
  };

  const createCategory = async (catData) => {
    if (!token) return { success: false, message: 'Must be logged in' };
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create category');
      await fetchCategories();
      return { success: true, category: data.category };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const updateCategory = async (catId, catData) => {
    if (!token) return { success: false, message: 'Must be logged in' };
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories/${catId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update category');
      await fetchCategories();
      return { success: true, category: data.category };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  const deleteCategory = async (catId) => {
    if (!token) return { success: false, message: 'Must be logged in' };
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories/${catId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete category');
      await fetchCategories();
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.message };
    }
  };

  // Helper Stats loader for Admin
  const fetchAdminStats = async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/stats`);
      if (!res.ok) throw new Error('Failed to load stats');
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Computed Cart Subtotal
  const cartSubtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      theme,
      token, user, login, register, logout,
      products, categories, loading, error, fetchProducts, fetchCategories,
      createCategory, updateCategory, deleteCategory, uploadImage,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartSubtotal, cartCount,
      orders, placeOrder, fetchOrders, updateOrderStatus,
      createProduct, updateProduct, deleteProduct, fetchAdminStats,
      searchQuery, setSearchQuery,
      activeCategory, setActiveCategory,
      activeSort, setActiveSort,
      deliveryLocation, setDeliveryLocation,
      showLocationModal, setShowLocationModal,
      cartDrawerOpen, setCartDrawerOpen
    }}>

      {children}
    </AppContext.Provider>
  );
};
