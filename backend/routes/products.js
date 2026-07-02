import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// Get all products (with optional search, filtering, and sorting)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, sort } = req.query;
    const db = await readDb();
    let products = [...db.products];

    // Filter by Category
    if (category && category !== 'all') {
      products = products.filter(p => p.category === category);
    }

    // Filter by Search Query
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Filter by Featured
    if (featured === 'true') {
      products = products.filter(p => p.featured === true);
    }

    // Sort Products
    if (sort) {
      if (sort === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sort === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      }
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db.categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
});

// Get single product details
router.get('/:id', async (req, res) => {
  try {
    const db = await readDb();
    const product = db.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
});

// Create a product (Admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, unit, category, image, stock, featured } = req.body;
    
    if (!name || !price || !category || !unit) {
      return res.status(400).json({ message: 'Name, price, category, and unit are required' });
    }

    const db = await readDb();
    const newProduct = {
      id: 'prod-' + Date.now(),
      name,
      description: description || '',
      price: parseFloat(price),
      unit,
      category,
      image: image || '/assets/images/placeholder.svg',
      stock: stock ? parseInt(stock) : 10,
      rating: 5.0,
      reviewsCount: 0,
      featured: featured === true || featured === 'true'
    };

    db.products.push(newProduct);
    await writeDb(db);

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
});

// Update a product (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, price, unit, category, image, stock, featured } = req.body;
    const db = await readDb();
    const productIndex = db.products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = {
      ...db.products[productIndex],
      name: name || db.products[productIndex].name,
      description: description !== undefined ? description : db.products[productIndex].description,
      price: price !== undefined ? parseFloat(price) : db.products[productIndex].price,
      unit: unit || db.products[productIndex].unit,
      category: category || db.products[productIndex].category,
      image: image || db.products[productIndex].image,
      stock: stock !== undefined ? parseInt(stock) : db.products[productIndex].stock,
      featured: featured !== undefined ? (featured === true || featured === 'true') : db.products[productIndex].featured
    };

    db.products[productIndex] = updatedProduct;
    await writeDb(db);

    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
});

// Delete a product (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const db = await readDb();
    const productIndex = db.products.findIndex(p => p.id === req.params.id);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }

    db.products.splice(productIndex, 1);
    await writeDb(db);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
});

// ==========================================
// Category Management & Image Upload Routes
// ==========================================

// Create a category (Admin only)
router.post('/categories', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, icon, image } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and Slug are required' });
    }

    const db = await readDb();
    const existing = db.categories.find(c => c.slug === slug || c.id === 'cat-' + slug);
    if (existing) {
      return res.status(400).json({ message: 'Category with this slug already exists' });
    }

    const newCategory = {
      id: 'cat-' + Date.now(),
      name,
      slug,
      icon: icon || 'Apple',
      image: image || '/assets/images/placeholder.svg'
    };

    db.categories.push(newCategory);
    await writeDb(db);

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// Update a category (Admin only)
router.put('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, slug, icon, image } = req.body;
    const db = await readDb();
    const index = db.categories.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const updatedCategory = {
      ...db.categories[index],
      name: name || db.categories[index].name,
      slug: slug || db.categories[index].slug,
      icon: icon || db.categories[index].icon,
      image: image || db.categories[index].image
    };

    db.categories[index] = updatedCategory;
    await writeDb(db);

    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
});

// Delete a category (Admin only)
router.delete('/categories/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const db = await readDb();
    const index = db.categories.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Category not found' });
    }

    db.categories.splice(index, 1);
    await writeDb(db);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

// Upload an image file (Admin only)
// Expects body: { name: "filename.png", type: "image/png", data: "base64encodeddata..." }
router.post('/upload', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, type, data } = req.body;
    if (!data || !name) {
      return res.status(400).json({ message: 'Name and Data (base64 string) are required' });
    }

    // Clean base64 prefix if present
    const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const uploadsDir = process.env.VERCEL
      ? path.join('/tmp', 'uploads')
      : path.join(__dirname, '..', 'uploads');
    // Ensure uploads folder exists
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique name
    const ext = path.extname(name) || '.png';
    const baseName = path.basename(name, ext).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFileName = `${baseName}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    await fs.writeFile(filePath, buffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${uniqueFileName}`;

    res.status(201).json({ message: 'Image uploaded successfully', url: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
});

export default router;
