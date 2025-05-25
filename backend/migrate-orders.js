// migrate-orders.js
const mongoose = require('mongoose');
const Order = require('./model/order');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
  .then(() => {
    console.log('Connected to MongoDB');
    return migrateOrders();
  })
  .catch(err => console.error('Connection error:', err));

async function migrateOrders() {
  try {
    const orders = await Order.find({ universalId: { $exists: false } });
    let counter = 0;
    
    for (const order of orders) {
      const date = order.createdAt.toISOString().split('T')[0].replace(/-/g, '');
      counter++;
      
      order.universalId = `ORD-${date}-${counter.toString().padStart(4, '0')}`;
      order.shortId = `ORD-${counter.toString().padStart(4, '0')}`;
      
      await order.save();
      console.log(`Updated order ${order._id}`);
    }
    
    console.log(`Migration complete. Updated ${counter} orders.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}