/**
 * Banned words dictionary organized by categories
 * Each word is mapped to a severity level (1-5)
 * 1: Mild | 2: Moderate | 3: Strong | 4: Severe | 5: Extreme
 */
const BANNED_WORDS = {
  // Profanity and offensive language
  profanity: {
    "fuck": 4, "fucking": 4, "f*ck": 3, "f**k": 3, "fck": 3, "fucker": 4, "motherfucker": 5, 
    "shit": 3, "sh*t": 3, "s**t":3, "bullshit": 3, "horseshit": 3, "asshole": 4, "a**hole": 3,
    "ass": 3, "a$$": 3, "arse": 2, "bitch": 4, "b*tch": 3, "bastard": 3, "cunt": 5, "c*nt": 4,
    "damn": 1, "dammit": 1, "cock": 4, "dick": 3, "d*ck": 3, "pussy": 4, "p*ssy": 3,
    "twat": 4, "wanker": 3, "whore": 4, "slut": 4, "prick": 3, "crap": 3,
    "tits": 3, "boobs": 3, "knockers": 3, "stfu": 4, "gtfo": 3, "wtf": 3, "lmfao": 3,"pee":4
  },
  
  // Sexual content
  sexual: {
    "sex": 3, "sexual": 3, "sexy": 3, "penis": 3, "vagina": 3, "blowjob": 5, "handjob": 5,
    "masturbate": 4, "masturbation": 4, "orgasm": 4, "cum": 4, "cumming": 4, "ejaculate": 4,
    "horny": 4, "aroused": 3, "erection": 4, "dildo": 4, "vibrator": 3, "anal": 4,
    "porn": 4, "pornography": 4, "xxx": 4, "orgy": 5, "threesome": 4, "foursome": 4,
    "69": 3, "bdsm": 4, "bondage": 4, "fetish": 3, "kinky": 3, "incest": 5
  },
  
  // Hate speech and discrimination
  hate: {
    "nigger": 5, "n*gger": 5, "negro": 4, "nigga": 5, "n*gga": 5, "fag": 5, "faggot": 5, "f*ggot": 5,
    "dyke": 5, "chink": 5, "gook": 5, "kike": 5, "spic": 5, "wetback": 5, "beaner": 5, "raghead": 5,
    "towelhead": 5, "retard": 5, "retarded": 5, "tranny": 5, "paki": 5, "homo": 4, "queer": 3,"hate":3,
    "jew": 1, // Context dependent - only flagged in offensive contexts
    "nazi": 4, "hitler": 3, "holocaust": 3, // Context dependent
    "racist": 3, "sexist": 3, "homophobic": 3, "transphobic": 3, // Context dependent
    "kill": 3, "murder": 3, "rape": 5, "molest": 5, "suicide": 3, // Context dependent
    "die": 3, "death": 3, "terrorist": 3, "jihad": 3,"brat":3,"stupid":3,"prick":3,"brat":3       // Context dependent
  },
  
  // Drugs and illegal activities
  illegal: {
    "cocaine": 4, "heroin": 4, "meth": 4, "crack": 3, "weed": 3, "marijuana": 3, "pot": 3,
    "lsd": 3, "acid": 1, "ecstasy": 3, "mdma": 3, "pills": 2, "xanax": 2, "valium": 2,
    "adderall": 2, "steroids": 3, "drug dealer": 3, "drug dealing": 3, "drugs": 3,
    "illegal": 3, "steal": 4, "robbery": 3, "hack": 1, "scam": 2, "fraud": 2,"gun":2,
    "weapon": 3, "gun": 3, "pistol": 3, "rifle": 3, "bomb": 3, "explosive": 3 ,"bomber":3,"suicide":4,"kill":4,"killing":3,"killed":3,"bombing":3
  }
};

// Combine all categories into a single dictionary for easy lookup
const ALL_BANNED_WORDS = {};
Object.values(BANNED_WORDS).forEach(category => {
  Object.assign(ALL_BANNED_WORDS, category);
});

/**
 * Checks text for banned words
 * @param {string} text - Text to check
 * @param {number} minSeverity - Minimum severity level to flag (1-5)
 * @returns {Object} Result with flagged words and their severity
 */
const checkBannedWords = (text, minSeverity = 1) => {
  if (!text || typeof text !== 'string') {
    return { hasBannedWords: false, flaggedWords: [] };
  }
  
  // Normalize text: lowercase, remove extra spaces, replace common character substitutions
  const normalizedText = text.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/8/g, 'b')
    .replace(/\$/g, 's');
  
  // Split into words and check each one
  const words = normalizedText.split(/\s+/);
  const flaggedWords = [];
  
  // Check for individual banned words
  words.forEach(word => {
    // Remove non-alphanumeric characters
    const cleanWord = word.replace(/[^\w]/g, '');
    
    if (ALL_BANNED_WORDS[cleanWord] && ALL_BANNED_WORDS[cleanWord] >= minSeverity) {
      flaggedWords.push({
        word: cleanWord,
        severity: ALL_BANNED_WORDS[cleanWord],
        category: getCategoryForWord(cleanWord)
      });
    }
  });
  
  // Check for multi-word banned phrases
  Object.keys(ALL_BANNED_WORDS).forEach(phrase => {
    if (phrase.includes(' ') && normalizedText.includes(phrase) && ALL_BANNED_WORDS[phrase] >= minSeverity) {
      flaggedWords.push({
        word: phrase,
        severity: ALL_BANNED_WORDS[phrase],
        category: getCategoryForWord(phrase)
      });
    }
  });
  
  return {
    hasBannedWords: flaggedWords.length > 0,
    flaggedWords
  };
};

/**
 * Helper function to get the category of a banned word
 * @param {string} word - Word to check
 * @returns {string} Category of the word
 */
const getCategoryForWord = (word) => {
  for (const [category, words] of Object.entries(BANNED_WORDS)) {
    if (words[word]) {
      return category;
    }
  }
  return 'unknown';
};

/**
 * Server-side content moderation utility
 * Checks for abusive content in the provided text fields using only banned words dictionary
 * @param {Object} content - Object containing text fields to moderate
 * @param {Object} options - Configuration options
 * @param {string[]} options.excludeFields - Fields to exclude from moderation
 * @param {number} options.wordSeverityThreshold - Severity threshold (1-5) for flagging banned words
 * @returns {Object} Moderation result with detailed information
 */
const moderateContent = (content, options = {}) => {
  try {
    const excludeFields = options.excludeFields || [];
    const wordSeverityThreshold = options.wordSeverityThreshold || 3;
    
    // Content should be an object with text fields to moderate
    const fieldsToCheck = Object.keys(content).filter(field => !excludeFields.includes(field));
    const flaggedFields = [];
    let isAbusive = false;
    let message = "";

    // Track detailed results for all fields for logging/debugging
    const detailedResults = {};

    // Check for banned words in all fields
    for (const field of fieldsToCheck) {
      const text = content[field];
      
      // Skip empty fields
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        continue;
      }
      
      // Check for banned words
      const bannedWordsResult = checkBannedWords(text, wordSeverityThreshold);
      
      if (bannedWordsResult.hasBannedWords) {
        const highestSeverity = Math.max(...bannedWordsResult.flaggedWords.map(w => w.severity));
        
        flaggedFields.push({
          field,
          wordBased: true,
          bannedWords: bannedWordsResult.flaggedWords,
          highestSeverity,
          reason: "banned_words",
          text: text.substring(0, 50) + (text.length > 50 ? "..." : "")
        });
        
        isAbusive = true;
        
        // Store detailed results
        detailedResults[field] = {
          bannedWords: bannedWordsResult
        };
      }
    }
    
    // If any fields were flagged, construct a message
    if (flaggedFields.length > 0) {
      message = "Content contains banned words and requires admin approval before publishing.";
      
      return {
        isValid: false,
        isAbusive,
        flaggedFields,
        message,
        detailedResults
      };
    }
    
    // If we get here, content passed moderation
    return { 
      isValid: true,
      detailedResults: {}
    };
  } catch (error) {
    console.error("Content moderation error:", error);
    // In case of an error, allow the content through but log the error
    return { 
      isValid: true, 
      error: error.message,
      errorType: error.name,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

/**
 * Performs content moderation with caching support
 * @param {Object} content - Object containing text fields to moderate
 * @param {Object} options - Configuration options
 * @returns {Object} Moderation result
 */
const moderateContentWithCache = (() => {
  // Simple in-memory cache
  const cache = new Map();
  const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  return (content, options = {}) => {
    try {
      const wordSeverityThreshold = options.wordSeverityThreshold || 3;
      const excludeFields = options.excludeFields || [];
      const fieldsToCheck = Object.keys(content).filter(field => !excludeFields.includes(field));
      
      // Calculate cache key from content
      const contentToHash = {};
      fieldsToCheck.forEach(key => {
        if (typeof content[key] === 'string') {
          contentToHash[key] = content[key];
        }
      });
      const cacheKey = JSON.stringify(contentToHash);
      
      // Check cache
      if (cache.has(cacheKey)) {
        const cachedResult = cache.get(cacheKey);
        if (Date.now() - cachedResult.timestamp < cacheExpiry) {
          return cachedResult.result;
        } else {
          // Remove expired cache entry
          cache.delete(cacheKey);
        }
      }
      
      // Perform actual moderation
      const result = moderateContent(content, options);
      
      // Save to cache
      cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error("Error in moderation with cache:", error);
      return { isValid: true, error: error.message };
    }
  };
})();

module.exports = {
  moderateContent,
  moderateContentWithCache,
  checkBannedWords,
  BANNED_WORDS
};