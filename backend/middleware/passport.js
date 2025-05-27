const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/user');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Shop = require('../model/shop'); 

// Configure Passport Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v2/user/auth/google/callback`,
      scope: ['profile', 'email'],
      state: true,
      profileFields: ['id', 'displayName', 'name', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google profile received:', profile);
      console.log('Email from profile:', profile.emails[0].value);
      
      try {
        // Ensure we have a valid email
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('No email found in Google profile');
          return done(new Error('No email found in Google profile'), false);
        }

        const email = profile.emails[0].value;
        console.log('Processing email:', email);

        // Check for existing user by Google ID first
        const googleUser = await User.findOne({ googleId: profile.id });
        if (googleUser) {
          console.log('Found existing Google user:', googleUser.email);
          return done(null, googleUser);
        }

        // Check for email match with existing account
        const existingUser = await User.findOne({ email: email });
        
        if (existingUser) {
          console.log('Found existing user with same email:', existingUser.email);
          
          // Link Google account to existing email account
          existingUser.googleId = profile.id;
          existingUser.isActive = true;
          
          // Save without triggering password hashing
          await User.findByIdAndUpdate(existingUser._id, {
            googleId: profile.id,
            isActive: true
          }, { new: true });
          
          console.log('Linked Google account to existing user');
          return done(null, existingUser);
        }

        // If no user exists, create a new user
        console.log('Creating new user for:', email);
        
        // Generate a secure random password for Google users
        const randomPassword = crypto.randomBytes(32).toString('hex');
        
        // Hash the password manually to avoid middleware conflicts
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        // Prepare user data
        const userData = {
          name: profile.displayName || profile.name?.givenName || 'Google User',
          email: email,
          password: hashedPassword,
          googleId: profile.id,
          isActive: true,
          role: 'user' // Explicitly set role
        };

        // Handle profile picture
        if (profile.photos && profile.photos[0] && profile.photos[0].value) {
          const filename = `google-${profile.id}-${Date.now()}.jpg`;
          userData.avatar = filename;
          
          // Download profile image asynchronously (don't wait for it)
          downloadProfileImage(profile.photos[0].value, filename);
        }

        // Create user using direct model creation to avoid middleware issues
        const newUser = new User(userData);
        
        // Save with validation disabled for password (since it's already hashed)
        await newUser.save({ validateBeforeSave: false });
        
        console.log('Created new Google user:', newUser.email);
        return done(null, newUser);

      } catch (error) {
        console.error('Google auth error for email:', profile.emails?.[0]?.value, error);
        return done(error, false);
      }
    }
  )
);

// Async function to download profile image
async function downloadProfileImage(profilePicUrl, filename) {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    const https = require('https');
    const file = fs.createWriteStream(filePath);
    
    https.get(profilePicUrl, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Profile image downloaded:', filename);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      console.error('Error downloading profile image:', err);
    });
  } catch (error) {
    console.error('Profile image download error:', error);
  }
}

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


// Configure Passport Google OAuth strategy for SHOPS
passport.use('google-shop',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v2/shop/auth/google/callback`,
      scope: ['profile', 'email'],
      state: true,
      profileFields: ['id', 'displayName', 'name', 'emails', 'photos']
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('Google shop profile received:', profile);
      console.log('Email from profile:', profile.emails[0].value);
      
      try {
        // Ensure we have a valid email
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          console.error('No email found in Google profile');
          return done(new Error('No email found in Google profile'), false);
        }

        const email = profile.emails[0].value;
        console.log('Processing shop email:', email);

        // Check for existing shop by Google ID first
        const googleShop = await Shop.findOne({ googleId: profile.id });
        if (googleShop) {
          console.log('Found existing Google shop:', googleShop.email);
          return done(null, googleShop);
        }

        // Check for email match with existing shop account
        const existingShop = await Shop.findOne({ email: email });
        
        if (existingShop) {
          console.log('Found existing shop with same email:', existingShop.email);
          
          // Link Google account to existing email account
          existingShop.googleId = profile.id;
          
          // Save without triggering password hashing
          await Shop.findByIdAndUpdate(existingShop._id, {
            googleId: profile.id
          }, { new: true });
          
          console.log('Linked Google account to existing shop');
          return done(null, existingShop);
        }

        // If no shop exists, create a new shop with DEFAULT VALUES
        console.log('Creating new shop for:', email);
        
        // Generate a secure random password for Google shops
        const randomPassword = crypto.randomBytes(32).toString('hex');
        
        // Hash the password manually to avoid middleware conflicts
        const hashedPassword = await bcrypt.hash(randomPassword, 12);

        // Prepare shop data with DEFAULT VALUES as requested
        const shopData = {
          name: profile.displayName || profile.name?.givenName || 'My Shop',
          email: email,
          password: hashedPassword,
          googleId: profile.id,
          role: 'Seller',
          // DEFAULT VALUES - keeping it simple as requested
          description: 'Welcome to my shop!',
          region: 'Default Region',
          area: 'Default Area', 
          address: 'Default Address',
          phoneNumber: 1234567890,
          zipCode: 12345
        };

        // Handle profile picture
        if (profile.photos && profile.photos[0] && profile.photos[0].value) {
          const filename = `google-shop-${profile.id}-${Date.now()}.jpg`;
          shopData.avatar = filename;
          
          // Download profile image asynchronously (don't wait for it)
          downloadShopProfileImage(profile.photos[0].value, filename);
        } else {
          // Default avatar for shops without profile picture
          shopData.avatar = 'default-shop-avatar.png';
        }

        // Create shop using direct model creation to avoid middleware issues
        const newShop = new Shop(shopData);
        
        // Save with validation disabled for password (since it's already hashed)
        await newShop.save({ validateBeforeSave: false });
        
        console.log('Created new Google shop:', newShop.email);
        return done(null, newShop);

      } catch (error) {
        console.error('Google shop auth error for email:', profile.emails?.[0]?.value, error);
        return done(error, false);
      }
    }
  )
);

// Async function to download shop profile image
async function downloadShopProfileImage(profilePicUrl, filename) {
  try {
    const filePath = path.join(__dirname, '../uploads', filename);
    const https = require('https');
    const file = fs.createWriteStream(filePath);
    
    https.get(profilePicUrl, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Shop profile image downloaded:', filename);
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Delete the file if there's an error
      console.error('Error downloading shop profile image:', err);
    });
  } catch (error) {
    console.error('Shop profile image download error:', error);
  }
}





module.exports = passport;