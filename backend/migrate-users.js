// migrate-users.js
const mongoose = require('mongoose');
const User = require('./model/user');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL_CONNECTION)
  .then(() => {
    console.log('Connected to MongoDB');
    return migrateUsers();
  })
  .catch(err => console.error('Connection error:', err));

async function migrateUsers() {
  try {
    const users = await User.find({ universalId: { $exists: false } });
    let counter = 0;
    
    for (const user of users) {
      const date = user.createdAt.toISOString().split('T')[0].replace(/-/g, '');
      counter++;
      
      // Using USER prefix
      user.universalId = `USER-${date}-${counter.toString().padStart(4, '0')}`;
      
      await user.save();
      console.log(`Updated user ${user._id}`);
    }
    
    console.log(`Migration complete. Updated ${counter} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}