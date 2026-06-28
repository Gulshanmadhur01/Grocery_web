import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import { readDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check and root route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Seed summary route for stats (Admin dashboard convenience)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const db = await readDb();
    const totalRevenue = db.orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      totalProducts: db.products.length,
      totalOrders: db.orders.length,
      totalUsers: db.users.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      pendingOrders: db.orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving stats', error: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Grocery Backend running on port ${PORT}`);
});
