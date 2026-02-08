const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if token matches stored token
    const user = await User.findOne({ 
      _id: decoded._id,
      token: token 
    });

    if (!user) {
      throw new Error();
    }

    // Add user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Please authenticate. Invalid or expired token.' 
    });
  }
};

module.exports = auth;