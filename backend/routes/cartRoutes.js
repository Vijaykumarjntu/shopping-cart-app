const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Item = require('../models/Item');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.item');
    
    if (!cart) {
      return res.json({ items: [], total: 0 });
    }
    
    // Calculate total
    const total = cart.items.reduce((sum, cartItem) => {
      return sum + (cartItem.item.price * cartItem.quantity);
    }, 0);
    
    res.json({ items: cart.items, total });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add item to cart
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.item.toString() === itemId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ item: itemId, quantity });
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate item details for response
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item quantity
router.put('/:itemId', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.item.toString() === req.params.itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.item.toString() !== req.params.itemId
    );
    
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;