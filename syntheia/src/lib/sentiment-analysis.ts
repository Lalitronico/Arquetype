// Simple sentiment analysis utilities
// In production, this would use a more sophisticated NLP model

interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  label: "positive" | "neutral" | "negative";
  confidence: number; // 0 to 1
}

interface TextAnalysis {
  sentiment: SentimentResult;
  keywords: string[];
  emotionalTone: {
    joy: number;
    trust: number;
    fear: number;
    surprise: number;
    sadness: number;
    disgust: number;
    anger: number;
    anticipation: number;
  };
}

// Positive and negative word lists for basic sentiment
const positiveWords = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", "love",
  "like", "best", "better", "happy", "pleased", "satisfied", "helpful",
  "easy", "fast", "reliable", "quality", "recommend", "perfect", "awesome",
  "outstanding", "impressive", "intuitive", "efficient", "effective", "useful",
  "convenient", "friendly", "responsive", "professional", "innovative", "valuable",
  "beautiful", "clean", "smooth", "seamless", "exceptional", "superb", "brilliant",
  "delightful", "pleasant", "enjoyable", "simple", "straightforward", "affordable",
]);

const negativeWords = new Set([
  "bad", "terrible", "awful", "horrible", "poor", "worst", "hate", "dislike",
  "difficult", "hard", "slow", "unreliable", "broken", "confusing", "frustrated",
  "disappointed", "annoying", "useless", "expensive", "complicated", "buggy",
  "unhelpful", "unresponsive", "unclear", "lacking", "missing", "problem",
  "issue", "error", "fail", "failure", "crash", "freeze", "lag", "clunky",
  "outdated", "overpriced", "mediocre", "boring", "ugly", "messy", "complex",
  "cumbersome", "tedious", "inconvenient", "unprofessional", "disappointing",
]);

// Emotional tone indicators
const emotionWords: Record<string, keyof TextAnalysis["emotionalTone"]> = {
  // Joy
  happy: "joy", joy: "joy", excited: "joy", delighted: "joy", pleased: "joy",
  thrilled: "joy", ecstatic: "joy", cheerful: "joy", glad: "joy",
  // Trust
  trust: "trust", reliable: "trust", dependable: "trust", secure: "trust",
  confident: "trust", faithful: "trust", honest: "trust",
  // Fear
  afraid: "fear", scared: "fear", worried: "fear", anxious: "fear",
  nervous: "fear", concerned: "fear", uncertain: "fear",
  // Surprise
  surprised: "surprise", amazed: "surprise", astonished: "surprise",
  shocked: "surprise", unexpected: "surprise", startled: "surprise",
  // Sadness
  sad: "sadness", unhappy: "sadness", disappointed: "sadness", depressed: "sadness",
  discouraged: "sadness", down: "sadness", upset: "sadness",
  // Disgust
  disgusted: "disgust", repulsed: "disgust", revolted: "disgust", gross: "disgust",
  // Anger
  angry: "anger", frustrated: "anger", annoyed: "anger", irritated: "anger",
  furious: "anger", outraged: "anger", mad: "anger",
  // Anticipation
  anticipate: "anticipation", expect: "anticipation", looking: "anticipation",
  hope: "anticipation", eager: "anticipation", waiting: "anticipation",
};

// Analyze sentiment of text
export function analyzeSentiment(text: string): SentimentResult {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "");
    if (positiveWords.has(cleanWord)) positiveCount++;
    if (negativeWords.has(cleanWord)) negativeCount++;
  }

  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) {
    return { score: 0, label: "neutral", confidence: 0.5 };
  }

  const score = (positiveCount - negativeCount) / totalSentimentWords;
  const confidence = Math.min(totalSentimentWords / 10, 1);

  let label: SentimentResult["label"];
  if (score > 0.2) label = "positive";
  else if (score < -0.2) label = "negative";
  else label = "neutral";

  return { score, label, confidence };
}

// Extract keywords from text
export function extractKeywords(text: string, limit: number = 10): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "must", "shall", "can", "need",
    "dare", "ought", "used", "this", "that", "these", "those", "i", "you",
    "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
    "my", "your", "his", "its", "our", "their", "mine", "yours", "hers",
    "ours", "theirs", "what", "which", "who", "whom", "when", "where",
    "why", "how", "all", "each", "every", "both", "few", "more", "most",
    "other", "some", "such", "no", "not", "only", "same", "so", "than",
    "too", "very", "just", "also", "now", "here", "there", "then", "once",
  ]);

  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const wordCount: Record<string, number> = {};

  for (const word of words) {
    if (!stopWords.has(word)) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }

  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

// Analyze emotional tone
export function analyzeEmotionalTone(text: string): TextAnalysis["emotionalTone"] {
  const words = text.toLowerCase().split(/\s+/);
  const tones: TextAnalysis["emotionalTone"] = {
    joy: 0,
    trust: 0,
    fear: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
    anger: 0,
    anticipation: 0,
  };

  let totalEmotionWords = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "");
    if (emotionWords[cleanWord]) {
      tones[emotionWords[cleanWord]]++;
      totalEmotionWords++;
    }
  }

  // Normalize to 0-1 scale
  if (totalEmotionWords > 0) {
    for (const key of Object.keys(tones) as Array<keyof typeof tones>) {
      tones[key] = Math.round((tones[key] / totalEmotionWords) * 100) / 100;
    }
  }

  return tones;
}

// Full text analysis
export function analyzeText(text: string): TextAnalysis {
  return {
    sentiment: analyzeSentiment(text),
    keywords: extractKeywords(text),
    emotionalTone: analyzeEmotionalTone(text),
  };
}

// Aggregate sentiment from multiple responses
export function aggregateSentiment(texts: string[]): {
  overall: SentimentResult;
  distribution: { positive: number; neutral: number; negative: number };
  topKeywords: string[];
  averageEmotionalTone: TextAnalysis["emotionalTone"];
} {
  const sentiments = texts.map(analyzeSentiment);
  const allKeywords = texts.flatMap((t) => extractKeywords(t, 5));
  const emotionalTones = texts.map(analyzeEmotionalTone);

  // Calculate distribution
  const distribution = {
    positive: sentiments.filter((s) => s.label === "positive").length,
    neutral: sentiments.filter((s) => s.label === "neutral").length,
    negative: sentiments.filter((s) => s.label === "negative").length,
  };

  // Calculate overall sentiment
  const avgScore =
    sentiments.reduce((acc, s) => acc + s.score, 0) / sentiments.length;
  const avgConfidence =
    sentiments.reduce((acc, s) => acc + s.confidence, 0) / sentiments.length;

  let overallLabel: SentimentResult["label"];
  if (avgScore > 0.2) overallLabel = "positive";
  else if (avgScore < -0.2) overallLabel = "negative";
  else overallLabel = "neutral";

  // Get top keywords across all responses
  const keywordCount: Record<string, number> = {};
  for (const kw of allKeywords) {
    keywordCount[kw] = (keywordCount[kw] || 0) + 1;
  }
  const topKeywords = Object.entries(keywordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  // Average emotional tones
  const averageEmotionalTone: TextAnalysis["emotionalTone"] = {
    joy: 0,
    trust: 0,
    fear: 0,
    surprise: 0,
    sadness: 0,
    disgust: 0,
    anger: 0,
    anticipation: 0,
  };

  for (const tone of emotionalTones) {
    for (const key of Object.keys(averageEmotionalTone) as Array<keyof typeof averageEmotionalTone>) {
      averageEmotionalTone[key] += tone[key];
    }
  }

  for (const key of Object.keys(averageEmotionalTone) as Array<keyof typeof averageEmotionalTone>) {
    averageEmotionalTone[key] = Math.round((averageEmotionalTone[key] / emotionalTones.length) * 100) / 100;
  }

  return {
    overall: {
      score: Math.round(avgScore * 100) / 100,
      label: overallLabel,
      confidence: Math.round(avgConfidence * 100) / 100,
    },
    distribution,
    topKeywords,
    averageEmotionalTone,
  };
}
