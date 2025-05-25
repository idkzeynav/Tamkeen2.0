// migrate-products.js
const mongoose = require('mongoose');
const Product = require('./model/product');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
  .then(() => {
    console.log('Connected to MongoDB');
    return migrateProducts();
  })
  .catch(err => console.error('Connection error:', err));

async function migrateProducts() {
  try {
    const products = await Product.find({ universalId: { $exists: false } });
    let counter = 0;
    
    for (const product of products) {
      const date = product.createdAt.toISOString().split('T')[0].replace(/-/g, '');
      counter++;
      
      product.universalId = `PROD-${date}-${counter.toString().padStart(4, '0')}`;
      
      await product.save();
      console.log(`Updated product ${product._id}`);
    }
    
    console.log(`Migration complete. Updated ${counter} products.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}