const mongoose = require('mongoose');
const Item = require('./models/Item');
require('dotenv').config();

const sampleItems = [
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracker with heart rate monitor and GPS',
    price: 249.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
  },
  {
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085'
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with cushioning technology',
    price: 129.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772'
  },
  {
    name: 'Backpack',
    description: 'Water-resistant backpack with laptop compartment',
    price: 59.99,
    category: 'Travel',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62'
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 39.99,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c'
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');
    
    // Clear existing items
    await Item.deleteMany({});
    console.log('Cleared existing items');
    
    // Insert sample items
    await Item.insertMany(sampleItems);
    console.log('Inserted sample items');
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

module.exports = seedDatabase;