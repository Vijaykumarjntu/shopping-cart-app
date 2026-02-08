const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  image: { 
    type: String 
  },
  category: { 
    type: String 
  },
  stock: { 
    type: Number, 
    default: 100 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Item', itemSchema);