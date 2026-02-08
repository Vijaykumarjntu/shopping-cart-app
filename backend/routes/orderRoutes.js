const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Item = require('../models/Item');

// Create order from cart
router.post('/', auth, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.item');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Prepare order items with current prices
    const orderItems = cart.items.map(cartItem => ({
      item: cartItem.item._id,
      quantity: cartItem.quantity,
      priceAtPurchase: cartItem.item.price
    }));
    
    // Calculate total
    const totalAmount = orderItems.reduce((sum, item) => {
      return sum + (item.priceAtPurchase * item.quantity);
    }, 0);
    
    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount
    });
    
    await order.save();
    
    // Clear the cart
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate item details for response
    await order.populate('items.item');
    
    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.item')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.item');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;