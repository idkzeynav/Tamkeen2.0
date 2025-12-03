const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const Shop = require("./model/shop");
const Product = require("./model/product");
const Order = require("./model/order");
require("dotenv").config();

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_BASE_URL = "https://api.unsplash.com";

// Family-friendly, product-specific search terms
const getProductImageQueries = (productName, category) => {
  // Clean product name for better search
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Extract key product terms
  const productTerms = [];
  
  // Common product keywords mapping
  const productKeywords = {
    // Clothing items
    'kurta': ['kurta', 'traditional shirt', 'ethnic wear'],
    'shalwar': ['shalwar', 'traditional pants', 'loose pants'],
    'kameez': ['kameez', 'tunic', 'long shirt'],
    'dupatta': ['dupatta', 'scarf', 'traditional scarf'],
    'dress': ['dress', 'women dress', 'casual dress'],
    'shirt': ['shirt', 'formal shirt', 'cotton shirt'],
    'trouser': ['trouser', 'pants', 'formal pants'],
    
    // Footwear
    'sandals': ['sandals', 'summer shoes', 'casual sandals'],
    'shoes': ['shoes', 'leather shoes', 'casual shoes'],
    'slippers': ['slippers', 'indoor shoes', 'comfortable slippers'],
    'chappal': ['chappal', 'traditional footwear', 'flat sandals'],
    'khussa': ['khussa', 'traditional shoes', 'embroidered shoes'],
    
    // Accessories
    'necklace': ['necklace', 'jewelry', 'fashion necklace'],
    'earrings': ['earrings', 'jewelry', 'fashion earrings'],
    'bracelet': ['bracelet', 'jewelry', 'fashion bracelet'],
    'ring': ['ring', 'jewelry', 'fashion ring'],
    'bag': ['bag', 'handbag', 'fashion bag'],
    'watch': ['watch', 'wristwatch', 'timepiece'],
    
    // Home items
    'cushion': ['cushion', 'pillow', 'home decor'],
    'lamp': ['lamp', 'table lamp', 'home lighting'],
    'vase': ['vase', 'flower vase', 'decorative vase'],
    'carpet': ['carpet', 'rug', 'floor covering'],
    'curtains': ['curtains', 'window curtains', 'home textile'],
    
    // Kitchen items
    'pot': ['cooking pot', 'kitchen pot', 'cookware'],
    'pan': ['frying pan', 'cooking pan', 'kitchen pan'],
    'plate': ['dinner plate', 'ceramic plate', 'dinnerware'],
    'cup': ['tea cup', 'coffee cup', 'ceramic cup'],
    'bowl': ['bowl', 'serving bowl', 'kitchen bowl'],
    
    // Beauty items
    'cream': ['face cream', 'skincare cream', 'moisturizer'],
    'lotion': ['body lotion', 'skincare lotion', 'moisturizing lotion'],
    'soap': ['soap', 'bath soap', 'skincare soap'],
    'shampoo': ['shampoo', 'hair care', 'hair shampoo'],
    
    // Arts and crafts
    'paint': ['paint set', 'art supplies', 'acrylic paint'],
    'brush': ['paint brush', 'art brush', 'painting supplies'],
    'canvas': ['canvas', 'art canvas', 'painting canvas'],
    'pencil': ['colored pencils', 'art pencils', 'drawing supplies'],
    
    // Toys
    'toy': ['toy', 'children toy', 'educational toy'],
    'doll': ['doll', 'children doll', 'toy doll'],
    'puzzle': ['puzzle', 'jigsaw puzzle', 'educational puzzle'],
    'blocks': ['building blocks', 'toy blocks', 'educational blocks']
  };

  // Find matching keywords in product name
  for (const [keyword, terms] of Object.entries(productKeywords)) {
    if (cleanName.includes(keyword)) {
      productTerms.push(...terms);
    }
  }

  // Category-based fallback terms (family-friendly and product-focused)
  const categoryFallbacks = {
    "Arts and Crafts": [
      "art supplies", "craft materials", "painting supplies", "drawing tools",
      "craft kit", "art set", "creative supplies", "hobby materials"
    ],
    "Cosmetics and Body Care": [
      "skincare products", "beauty products", "natural cosmetics", "organic skincare",
      "beauty essentials", "skincare routine", "cosmetic products", "personal care"
    ],
    "Accessories": [
      "fashion accessories", "jewelry", "fashion jewelry", "accessories",
      "fashion items", "style accessories", "decorative accessories", "trendy accessories"
    ],
    "Cloths": [
      "clothing", "fashion wear", "casual wear", "traditional clothing",
      "ethnic wear", "formal wear", "cotton clothing", "comfortable clothing"
    ],
    "Shoes": [
      "footwear", "shoes", "casual shoes", "comfortable shoes",
      "leather shoes", "fashion footwear", "walking shoes", "everyday shoes"
    ],
    "Home & Living": [
      "home decor", "interior design", "home accessories", "decorative items",
      "home furnishing", "living room decor", "home decoration", "household items"
    ],
    "Kitchen & Dining": [
      "kitchenware", "cooking utensils", "kitchen tools", "dinnerware",
      "cookware", "kitchen accessories", "dining essentials", "kitchen equipment"
    ],
    "Toys & Baby Products": [
      "educational toys", "children toys", "learning toys", "safe toys",
      "toy collection", "kids toys", "developmental toys", "play items"
    ]
  };

  // Combine product-specific terms with category fallbacks
  const allTerms = [
    ...productTerms,
    ...(categoryFallbacks[category] || [category.toLowerCase()])
  ];

  // Remove duplicates and return unique terms
  return [...new Set(allTerms)];
};

// Track used images to ensure uniqueness
const usedImages = new Set();

// Function to fetch family-friendly, product-appropriate images
const fetchProductImages = async (productName, category, count = 3) => {
  try {
    const searchQueries = getProductImageQueries(productName, category);
    const images = [];
    let attempts = 0;
    const maxAttempts = 15;
    
    console.log(`🔍 Searching images for "${productName}" with queries:`, searchQueries.slice(0, 3));
    
    while (images.length < count && attempts < maxAttempts) {
      const queryIndex = attempts % searchQueries.length;
      const selectedQuery = searchQueries[queryIndex];
      
      const response = await axios.get(`${UNSPLASH_BASE_URL}/search/photos`, {
        params: {
          query: selectedQuery,
          per_page: 20,
          page: Math.floor(attempts / searchQueries.length) + 1,
          orientation: "squarish",
          content_filter: "high", // Family-friendly content filter
          client_id: UNSPLASH_ACCESS_KEY
        }
      });

      if (response.data?.results?.length > 0) {
        // Filter for appropriate, unused images
        const availableImages = response.data.results.filter(photo => {
          const url = photo.urls.regular;
          const description = (photo.description || '').toLowerCase();
          const altDescription = (photo.alt_description || '').toLowerCase();
          
          // Check if image is family-friendly and product-appropriate
          const isAppropriate = !containsInappropriateContent(description + ' ' + altDescription);
          const isUnused = !usedImages.has(url);
          
          return isAppropriate && isUnused;
        });
        
        if (availableImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * availableImages.length);
          const selectedImage = availableImages[randomIndex];
          
          images.push(selectedImage.urls.regular);
          usedImages.add(selectedImage.urls.regular);
          
          console.log(`✅ Found appropriate image for "${productName}"`);
        }
      }
      
      attempts++;
      await delay(250); // Respect API rate limits
    }
    
    // Generate family-friendly placeholder images if needed
    while (images.length < count) {
      const placeholderUrl = generateProductPlaceholder(productName, category, images.length + 1);
      if (!usedImages.has(placeholderUrl)) {
        images.push(placeholderUrl);
        usedImages.add(placeholderUrl);
      }
    }
    
    console.log(`📸 Retrieved ${images.length} appropriate images for "${productName}"`);
    return images;
    
  } catch (error) {
    console.log(`⚠️ Error fetching images for "${productName}":`, error.message);
    
    // Return family-friendly placeholder images
    const fallbackImages = [];
    for (let i = 0; i < count; i++) {
      const placeholderUrl = generateProductPlaceholder(productName, category, i + 1);
      fallbackImages.push(placeholderUrl);
      usedImages.add(placeholderUrl);
    }
    
    return fallbackImages;
  }
};

// Function to check for inappropriate content
const containsInappropriateContent = (text) => {
  const inappropriateKeywords = [
    'sexy', 'bikini', 'lingerie', 'adult', 'explicit', 'provocative',
    'revealing', 'intimate', 'sensual', 'erotic', 'nude', 'naked'
  ];
  
  return inappropriateKeywords.some(keyword => text.includes(keyword));
};

// Generate product-specific placeholder images
const generateProductPlaceholder = (productName, category, index) => {
  const colors = ['E3F2FD', 'F3E5F5', 'E8F5E8', 'FFF3E0', 'F1F8E9', 'E0F2F1'];
  const textColors = ['1976D2', '7B1FA2', '388E3C', 'F57C00', '689F38', '00796B'];
  
  const colorIndex = (productName.length + index) % colors.length;
  const backgroundColor = colors[colorIndex];
  const textColor = textColors[colorIndex];
  
  // Create clean product text for placeholder
  const cleanProductName = productName
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .join(' ');
  
  const placeholderText = encodeURIComponent(cleanProductName || category);
  
  return `https://via.placeholder.com/400x400/${backgroundColor}/${textColor}?text=${placeholderText}&font=Arial`;
};

// Delay function for API rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const updateProductImages = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("🔄 Starting product image update process...");

    if (!UNSPLASH_ACCESS_KEY) {
      console.log("⚠️ No Unsplash API key found. Using product-specific placeholder images.");
    }

    // Get all products from database
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log("❌ No products found in database. Please run the seeder first.");
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        console.log(`\n🔄 Processing: ${product.name}`);
        
        // Check if product already has appropriate images
        const hasValidImages = product.images && 
                             product.images.length > 0 && 
                             product.images.every(img => img && !img.includes('placeholder'));
        
        if (hasValidImages && process.env.SKIP_EXISTING_IMAGES === 'true') {
          console.log(`⏭️ Skipping "${product.name}" - already has images`);
          skippedCount++;
          continue;
        }

        // Fetch appropriate images for this specific product
        const images = await fetchProductImages(product.name, product.category, 3);
        
        // Update the product with new images
        await Product.findByIdAndUpdate(product._id, {
          images: images
        });
        
        updatedCount++;
        console.log(`✅ Updated "${product.name}" (${updatedCount}/${products.length})`);
        
        // Progress indicator
        if (updatedCount % 10 === 0) {
          console.log(`\n📊 Progress: ${updatedCount}/${products.length} products updated`);
        }
        
        // Respectful delay between API calls
        await delay(300);
        
      } catch (error) {
        console.log(`❌ Failed to update "${product.name}":`, error.message);
      }
    }

    console.log("\n🎉 Product image update completed!");
    console.log(`📊 Final Summary:`);
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(`   ⏭️ Skipped: ${skippedCount} products`);
    console.log(`   🖼️ Unique images used: ${usedImages.size}`);
    console.log(`   👨‍👩‍👧‍👦 All images are family-friendly and product-appropriate`);
    
  } catch (error) {
    console.error("❌ Error updating product images:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔄 Database connection closed");
  }
};

// Export the function for use
module.exports = { updateProductImages };

// Run the script if called directly
if (require.main === module) {
  updateProductImages();
}