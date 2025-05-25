// migrate-shop-ids.js
const mongoose = require('mongoose');
const Shop = require('./model/shop');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
  .then(() => {
    console.log('Connected to MongoDB');
    return migrateShopIds();
  })
  .catch(err => console.error('Connection error:', err));

async function migrateShopIds() {
  try {
    // Find all shops that either:
    // 1. Have SELL- prefix in universalId, OR
    // 2. Don't have universalId at all
    const shops = await Shop.find({
      $or: [
        { universalId: { $regex: /^SELL-/ } },
        { universalId: { $exists: false } }
      ]
    });

    let updatedCount = 0;
    
    for (const shop of shops) {
      if (shop.universalId && shop.universalId.startsWith('SELL-')) {
        // Replace SELL- with SHOP- while keeping the rest of the ID
        shop.universalId = shop.universalId.replace(/^SELL-/, 'SHOP-');
        updatedCount++;
      } else if (!shop.universalId) {
        // Generate new SHOP- prefixed ID for shops without universalId
        const date = shop.createdAt.toISOString().split('T')[0].replace(/-/g, '');
        const count = await Shop.countDocuments({
          createdAt: { $lt: shop.createdAt }
        });
        shop.universalId = `SHOP-${date}-${(count + 1).toString().padStart(4, '0')}`;
        updatedCount++;
      }
      
      await shop.save();
      console.log(`Updated shop ${shop._id} with new ID: ${shop.universalId}`);
    }
    
    console.log(`Migration complete. Updated ${updatedCount} shops.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}