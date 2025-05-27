require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./model/product'); // Adjust path as needed

// Database connection
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Migration function
const updateExistingProductImages = async () => {
  try {
    console.log('Starting product images migration...');
    
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);
    
    let updatedCount = 0;
    
    for (let product of products) {
      if (product.images && product.images.length > 0) {
        let needsUpdate = false;
        const updatedImages = product.images.map(image => {
          // If it's not already a full URL, convert it
          if (!image.startsWith('http://') && !image.startsWith('https://')) {
            needsUpdate = true;
            return `http://localhost:${process.env.PORT}/uploads/${image}`;
          }
          return image;
        });
        
        if (needsUpdate) {
          await Product.findByIdAndUpdate(product._id, { images: updatedImages });
          updatedCount++;
          console.log(`Updated product: ${product.name} (ID: ${product._id})`);
        }
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} products.`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

// Run the migration
const runMigration = async () => {
  await connectDatabase();
  await updateExistingProductImages();
  
  // Close the database connection
  mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
};

// Execute the migration
runMigration();