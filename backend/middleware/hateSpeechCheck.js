// module.exports = hateSpeechCheck;
const { InferenceClient } = require('@huggingface/inference');

const hatePatterns = [
  // Direct hate/violence patterns
  /\b(kill|murder|die|death to)\b.{0,30}\b(all|every)?\b.{0,30}\b(jews?|muslims?|christians?|blacks?|whites?|asians?|gays?|lgbt|trans(gender)?s?)\b/i,
  /\b(hate|hating|hateful|destroy|eliminate)\b.{0,20}\b(jews?|muslims?|christians?|blacks?|whites?|asians?|gays?|lgbt|trans(gender)?s?)\b/i,
  /\b(racist|sexist|bigot|nazi|fascist|kkk)\b/i,

  // Terrorism-related patterns
  /\b(suicide (bomb|bomber)|terrorist|terrorism|jihad|mass shooting|school shooting|isis|al[-\s]?qaeda|taliban|hamas)\b/i,

  // Glorifying violence
  /\b(long live|hail)\b.{0,20}\b(hitler|osama|bin laden|terrorists?|killers?)\b/i,
];

const hateSpeechDetection = (options = {}) => {
  const {
    threshold = 0.7,
    enforcementMode = true
  } = options;

  const HF_API_TOKEN = process.env.HF_API_TOKEN;

  if (!HF_API_TOKEN) {
    throw new Error("Hugging Face API token not configured in environment.");
  }

  const client = new InferenceClient(HF_API_TOKEN);

  return async (req, res, next) => {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required for hate speech detection.' });
    }

    try {
      // Pattern matching first
      const patternMatched = hatePatterns.some(pattern => pattern.test(content));

      if (patternMatched && enforcementMode) {
        return res.status(403).json({
          error: 'Content rejected due to policy violation (manual pattern matched).',
          details: { type: 'hate_speech', matchedBy: 'pattern' }
        });
      }

      // ML Model classification
      const result = await detectWithHuggingFace(client, content, threshold);
      const { isHateful, score } = result;

      console.log(`Hate speech check: content ${isHateful ? 'flagged' : 'passed'} with score ${score}`);

      req.contentModeration = {
        isHateful,
        score,
        matchedBy: isHateful ? 'ml_model' : patternMatched ? 'pattern' : 'none',
        apiUsed: 'huggingface'
      };

      if (enforcementMode && isHateful) {
        return res.status(403).json({
          error: 'Content rejected due to policy violation.',
          details: { type: 'hate_speech', score }
        });
      }

      next();
    } catch (err) {
      console.error("Hate speech detection failed:", err.message);
      return res.status(500).json({ error: "Error validating content." });
    }
  };
};

async function detectWithHuggingFace(client, content, threshold) {
  const results = await client.textClassification({
    model: 'unitary/toxic-bert',
    inputs: content
  });

  const toxicLabels = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate'];

  const toxicScores = results.filter(item =>
    toxicLabels.includes(item.label.toLowerCase())
  );

  const highestScore = toxicScores.length > 0
    ? Math.max(...toxicScores.map(item => item.score))
    : 0;

  return {
    isHateful: highestScore > threshold,
    score: highestScore
  };
}

module.exports = hateSpeechDetection;

