import express from 'express';
import { readDb, writeDb } from '../db.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Place a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    const db = await readDb();
    let totalAmount = 0;
    const orderItems = [];

    // Verify stock and compute total
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }

      // Decrement stock
      product.stock -= item.quantity;
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    const deliveryFee = totalAmount > 1000 ? 0 : 99;
    const grandTotal = totalAmount + deliveryFee;

    const newOrder = {
      id: 'ord-' + Date.now(),
      userId: req.userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Card',
      subtotal: parseFloat(totalAmount.toFixed(2)),
      deliveryFee: parseFloat(deliveryFee.toFixed(2)),
      total: parseFloat(grandTotal.toFixed(2)),
      status: 'Placed', // Placed, Processing, Out for Delivery, Delivered, Cancelled
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);
    await writeDb(db);

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

// Get user orders or all orders (if Admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await readDb();
    let userOrders;

    if (req.userRole === 'admin') {
      // Admins see all orders
      userOrders = db.orders;
      
      // Attach user details to the response for admin visibility
      userOrders = userOrders.map(order => {
        const user = db.users.find(u => u.id === order.userId);
        return {
          ...order,
          userName: user ? user.name : 'Unknown User',
          userEmail: user ? user.email : 'Unknown Email'
        };
      });
    } else {
      // Normal customers see only their own orders
      userOrders = db.orders.filter(o => o.userId === req.userId);
    }

    // Sort by newest first
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve orders', error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Placed', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status update request' });
    }

    const db = await readDb();
    const orderIndex = db.orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If status is updated, we can modify it
    db.orders[orderIndex].status = status;
    db.orders[orderIndex].updatedAt = new Date().toISOString();
    await writeDb(db);

    res.json({ message: 'Order status updated successfully', order: db.orders[orderIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

export default router;
