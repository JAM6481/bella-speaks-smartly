
import type { IntentResult, AgentType } from '@/types/bella';

// Mock intent recognition service
// In a real implementation, this would communicate with a backend NLU system

// Sample intents
const intents = {
  greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
  farewell: ['bye', 'goodbye', 'see you', 'talk to you later', 'farewell'],
  help: ['help', 'assist', 'support', 'guide'],
  calendar: ['schedule', 'calendar', 'appointment', 'event', 'meeting', 'reminder'],
  email: ['email', 'mail', 'send a message', 'write an email', 'compose'],
  contacts: ['contact', 'person', 'people', 'address book', 'phone number'],
  weather: ['weather', 'forecast', 'temperature', 'rain', 'snow', 'sunny'],
  traffic: ['traffic', 'commute', 'route', 'directions', 'navigate'],
  news: ['news', 'headlines', 'current events', 'what\'s happening'],
  sports: ['sports', 'game', 'score', 'team', 'match', 'player'],
  music: ['music', 'song', 'artist', 'album', 'play', 'listen'],
  timer: ['timer', 'countdown', 'alarm', 'remind me', 'alert'],
  math: ['calculate', 'math', 'add', 'subtract', 'multiply', 'divide', 'formula'],
  convert: ['convert', 'translation', 'exchange', 'transform', 'change'],
  search: ['search', 'find', 'lookup', 'google', 'information'],
  settings: ['settings', 'preferences', 'configure', 'customize', 'options']
};

// Sample entities
const entityTypes = {
  date: ['today', 'tomorrow', 'yesterday', 'next week', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  time: ['morning', 'afternoon', 'evening', 'night', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm', '12 pm', 'noon', 'midnight', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am', '12 am'],
  person: ['john', 'jane', 'smith', 'johnson', 'williams', 'jones', 'brown', 'davis', 'miller', 'wilson', 'moore', 'taylor', 'anderson', 'thomas'],
  location: ['home', 'work', 'office', 'school', 'park', 'restaurant', 'cafe', 'store', 'mall', 'airport', 'hospital', 'library', 'gym', 'beach'],
  event_title: ['meeting', 'conference', 'appointment', 'call', 'lunch', 'dinner', 'birthday', 'anniversary', 'party', 'concert', 'game', 'movie'],
  email_subject: ['report', 'update', 'information', 'request', 'invitation', 'confirmation', 'reminder', 'notification', 'alert']
};

// Emotions
const emotions = ['happy', 'sad', 'angry', 'excited', 'anxious', 'calm', 'confused', 'surprised', 'frustrated', 'curious'];

// Function to identify agent type from message content
export const identifyAgentType = (content: string): AgentType => {
  content = content.toLowerCase();
  
  // Define patterns for different agent types
  const patterns = {
    'researcher': ['research', 'investigate', 'analyze data', 'find information', 'study', 'academic'],
    'writer': ['write', 'draft', 'compose', 'article', 'essay', 'content', 'blog', 'story'],
    'analyst': ['analyze', 'evaluate', 'statistics', 'trends', 'data', 'metrics', 'reports', 'insights'],
    'creative': ['design', 'create', 'innovative', 'artistic', 'new ideas', 'brainstorm', 'creative'],
    'business': ['business', 'strategy', 'market', 'company', 'organization', 'management', 'profit'],
    'coding': ['code', 'programming', 'developer', 'software', 'app', 'function', 'bug', 'technology'],
    'medical': ['health', 'medical', 'symptom', 'doctor', 'treatment', 'disease', 'wellness', 'diagnosis'],
    'finance': ['money', 'finance', 'invest', 'budget', 'saving', 'expense', 'financial', 'economy'],
    'social': ['social media', 'post', 'engagement', 'followers', 'platform', 'audience', 'content strategy']
  };
  
  // Check each pattern
  for (const [agentType, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return agentType as AgentType;
      }
    }
  }
  
  // Default to 'general' if no specific type is matched
  return 'general';
};

export const analyzeIntent = (text: string): IntentResult => {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Find matching intent
  let matchedIntent = 'general';
  let confidence = 0.4; // Default confidence
  
  // Try to match intents
  for (const [intent, patterns] of Object.entries(intents)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        matchedIntent = intent;
        confidence = 0.7 + (Math.random() * 0.3); // Higher confidence for direct matches
        break;
      }
    }
  }
  
  // Extract entities
  const entities: Record<string, any> = {};
  
  for (const [entityType, patterns] of Object.entries(entityTypes)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        if (!entities[entityType]) {
          entities[entityType] = [];
        }
        entities[entityType].push(pattern);
      }
    }
  }
  
  // Detect primary emotion (simple keyword-based approach)
  let primaryEmotion = undefined;
  for (const emotion of emotions) {
    if (lowerText.includes(emotion)) {
      primaryEmotion = emotion;
      break;
    }
  }
  
  // Extract user preferences (very simplistic approach)
  const userPreferences: Record<string, any> = {};
  
  if (lowerText.includes('i like') || lowerText.includes('i prefer') || lowerText.includes('i want')) {
    const words = lowerText.split(' ');
    for (let i = 0; i < words.length; i++) {
      if ((words[i] === 'like' || words[i] === 'prefer' || words[i] === 'want') && i > 0 && words[i-1] === 'i' && i < words.length - 1) {
        // Extract what comes after "I like/prefer/want"
        const preference = words.slice(i+1).join(' ').replace(/[.,!?].*$/, '').trim();
        userPreferences.preferredTopic = preference;
      }
    }
  }
  
  // Detect dark mode preference
  if (lowerText.includes('dark mode') || lowerText.includes('dark theme')) {
    if (lowerText.includes('enable') || lowerText.includes('turn on') || lowerText.includes('switch to')) {
      userPreferences.darkMode = true;
    } else if (lowerText.includes('disable') || lowerText.includes('turn off')) {
      userPreferences.darkMode = false;
    }
  }
  
  // Voice preference
  if (lowerText.includes('voice') || lowerText.includes('speak')) {
    if (lowerText.includes('enable') || lowerText.includes('turn on')) {
      userPreferences.voiceOutput = true;
    } else if (lowerText.includes('disable') || lowerText.includes('turn off') || lowerText.includes('mute')) {
      userPreferences.voiceOutput = false;
    }
  }
  
  // Determine the agent type needed based on content
  const agentType = identifyAgentType(text);
  
  // Create mock recent topics from the detected entities and intent
  const recentTopics = [matchedIntent];
  for (const entityType in entities) {
    recentTopics.push(entityType);
  }
  
  return {
    intent: matchedIntent,
    confidence,
    entities,
    topIntent: matchedIntent,
    text: lowerText,
    primaryEmotion,
    contextualMemory: {
      userPreferences,
      recentTopics
    }
  };
};
