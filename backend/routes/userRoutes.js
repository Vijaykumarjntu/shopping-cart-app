const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create new user
    const user = new User({ username, password });
    await user.save();

    res.status(201).json({ 
      message: 'User created successfully',
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user (with single-device restriction)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Check if user is already logged in on another device
    if (user.token) {
      return res.status(403).json({ 
        error: 'You cannot login on another device. Please logout from other device first.' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    // Save token to DB (single-device lock)
    user.token = token;
    await user.save();

    res.json({ 
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    // Clear token from DB
    req.user.token = null;
    await req.user.save();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  res.json({ 
    user: { id: req.user._id, username: req.user.username }
  });
});

module.exports = router;