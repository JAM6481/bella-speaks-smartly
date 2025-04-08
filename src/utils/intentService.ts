
/**
 * Enhanced intent recognition service for Bella
 * This provides sophisticated natural language understanding with emotion detection
 */

export interface Intent {
  name: string;
  confidence: number;
}

export interface Entity {
  entity: string;
  value: string;
  start: number;
  end: number;
}

export interface Emotion {
  type: 'happy' | 'sad' | 'angry' | 'surprised' | 'confused' | 'neutral' | 'excited' | 'concerned';
  confidence: number;
}

export interface IntentResult {
  text: string;
  intents: Intent[];
  entities: Entity[];
  emotions: Emotion[];
  topIntent: string;
  primaryEmotion: Emotion['type'];
  contextualMemory?: {
    recentTopics?: string[];
    userPreferences?: Record<string, any>;
  };
}

// Define comprehensive intents with their trigger patterns
const intentDefinitions = [
  {
    name: 'greeting',
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'howdy', "what's up", 'hello there', 'hi there'],
  },
  {
    name: 'weather',
    triggers: ['weather', 'forecast', 'temperature', 'rain', 'sunny', 'cloudy', 'humidity', 'precipitation', 'meteorology', 'climate', 'atmospheric conditions'],
  },
  {
    name: 'reminder',
    triggers: ['remind', 'reminder', 'schedule', 'appointment', 'remember', 'calendar', 'alert', 'notification', 'task', 'deadline', 'don\'t forget', 'set a reminder'],
  },
  {
    name: 'search',
    triggers: ['search', 'find', 'look up', 'google', 'information', 'research', 'data', 'details', 'facts', 'knowledge', 'query', 'locate', 'discover'],
  },
  {
    name: 'help',
    triggers: ['help', 'assist', 'support', 'guide', 'aid', 'advice', 'guidance', 'instruction', 'direction', 'clarification', 'assistance', 'how do you', 'how can you'],
  },
  {
    name: 'joke',
    triggers: ['joke', 'funny', 'humor', 'laugh', 'comedy', 'pun', 'entertain', 'amuse', 'make me laugh', 'tell me a joke', 'know any jokes'],
  },
  {
    name: 'farewell',
    triggers: ['bye', 'goodbye', 'see you', 'later', 'farewell', 'see you later', 'take care', 'until next time', 'have a good day', 'have a nice day', 'adios'],
  },
  {
    name: 'gratitude',
    triggers: ['thank', 'thanks', 'appreciate', 'grateful', 'thank you', 'thanks a lot', 'much appreciated', 'i appreciate it'],
  },
  {
    name: 'personal',
    triggers: ['your name', 'who are you', 'about yourself', 'tell me about you', 'what are you', 'what can you do'],
  },
  {
    name: 'news',
    triggers: ['news', 'current events', 'latest', 'headlines', 'what\'s happening', 'recent events', 'today\'s news'],
  },
  {
    name: 'time',
    triggers: ['time', 'what time', 'current time', 'clock', 'hour', 'date', 'day', 'today', 'what day', 'what date'],
  },
  {
    name: 'recommendation',
    triggers: ['recommend', 'suggestion', 'suggest', 'what should', 'advise', 'proposal', 'options', 'alternatives'],
  },
  // New intents for integration with Google services and Outlook
  {
    name: 'calendar',
    triggers: ['calendar', 'schedule', 'event', 'appointment', 'meeting', 'sync calendar', 'google calendar', 'outlook calendar', 'add to calendar', 'check calendar'],
  },
  {
    name: 'email',
    triggers: ['email', 'mail', 'message', 'send email', 'compose email', 'check email', 'inbox', 'google mail', 'gmail', 'outlook', 'outlook email'],
  },
  {
    name: 'contacts',
    triggers: ['contacts', 'contact', 'address book', 'people', 'google contacts', 'phone number', 'email address', 'find contact', 'search contact'],
  },
  {
    name: 'learning_preference',
    triggers: ['remember this', 'i like', 'i prefer', 'my favorite', 'i don\'t like', 'learn about me', 'remember my preference', 'remember that i'],
  },
];

// Emotion detection patterns
const emotionPatterns = [
  {
    type: 'happy',
    patterns: [
      /\b(?:happy|glad|delighted|pleased|joy|joyful|excellent|wonderful|great|fantastic|amazing)\b/i,
      /\b(?:😊|😃|😄|😁|🙂|😀|🥰|😍)\b/,
      /\bthank you\b/i
    ]
  },
  {
    type: 'sad',
    patterns: [
      /\b(?:sad|unhappy|depressed|disappointed|sorry|regret|miss|missing|lonely|upset)\b/i,
      /\b(?:😔|😢|😭|😞|😥|☹️|🙁)\b/
    ]
  },
  {
    type: 'angry',
    patterns: [
      /\b(?:angry|mad|furious|annoyed|irritated|frustrated|hate|awful|terrible)\b/i,
      /\b(?:😠|😡|🤬|😤|👿)\b/
    ]
  },
  {
    type: 'surprised',
    patterns: [
      /\b(?:surprised|wow|whoa|oh my|unexpected|unbelievable|amazing|astonished|astonishing)\b/i,
      /\b(?:😲|😮|😯|😱|😵|🤯)\b/,
      /\?!+/
    ]
  },
  {
    type: 'confused',
    patterns: [
      /\b(?:confused|don't understand|unsure|unclear|puzzled|lost|perplexed|bewildered)\b/i,
      /\b(?:🤔|😕|😟|❓|🤨)\b/,
      /\?{2,}/
    ]
  },
  {
    type: 'excited',
    patterns: [
      /\b(?:excited|thrilled|eager|can't wait|looking forward|pumped)\b/i,
      /\b(?:🤩|😆|🎉|✨|🔥|💯)\b/,
      /!{2,}/
    ]
  },
  {
    type: 'concerned',
    patterns: [
      /\b(?:worried|concerned|anxious|nervous|fear|afraid|scared|apprehensive)\b/i,
      /\b(?:😟|😧|😨|😰|😬)\b/
    ]
  }
];

// User preferences storage - would be persistent in a real app
let userPreferences: Record<string, any> = {};
let recentTopics: string[] = [];

// Learn from user interactions
const learnPreference = (text: string, entities: Entity[]): void => {
  // Check for preference statements
  const preferencePatterns = [
    {
      pattern: /\bi (?:like|love|enjoy|prefer) (.*?)(?:\.|\,|\!|\?|$)/i,
      type: 'like'
    },
    {
      pattern: /\bi (?:dislike|hate|don't like|do not like) (.*?)(?:\.|\,|\!|\?|$)/i,
      type: 'dislike'
    },
    {
      pattern: /\bmy favorite (.*?) is (.*?)(?:\.|\,|\!|\?|$)/i,
      type: 'favorite'
    },
    {
      pattern: /\bremember (?:that )i (.*?)(?:\.|\,|\!|\?|$)/i,
      type: 'remember'
    }
  ];

  // Extract preferences
  for (const { pattern, type } of preferencePatterns) {
    const match = pattern.exec(text);
    if (match) {
      if (type === 'favorite' && match[1] && match[2]) {
        userPreferences[`favorite_${match[1].trim()}`] = match[2].trim();
      } else if (match[1]) {
        userPreferences[type] = match[1].trim();
      }
    }
  }

  // Learn from entities too
  if (entities.length > 0) {
    entities.forEach(entity => {
      if (entity.entity === 'topic' || entity.entity === 'query') {
        // Track recent topics for contextual awareness
        recentTopics.unshift(entity.value);
        if (recentTopics.length > 5) recentTopics.pop(); // Keep last 5 topics
      }
    });
  }
};

/**
 * Advanced entity detection with improved pattern matching
 */
const detectEntities = (text: string): Entity[] => {
  const entities: Entity[] = [];
  const lowerText = text.toLowerCase();
  
  // Detect locations (improved pattern matching)
  const locationPatterns = [
    /\b(?:in|at|for|from|to) ([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g,
    /\b(New York|Los Angeles|San Francisco|Las Vegas|Washington D\.C\.|[A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g
  ];
  
  locationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const location = match[1];
      const start = match.index + (match[0].indexOf(location));
      entities.push({
        entity: 'location',
        value: location,
        start,
        end: start + location.length,
      });
    }
  });
  
  // Detect dates (expanded patterns)
  const datePatterns = [
    /\b(today|tomorrow|yesterday|next week|next month|next year|this week|this weekend)\b/gi,
    /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}(?:st|nd|rd|th)?\b/gi,
    /\b\d{1,2}(?:st|nd|rd|th)? (?:of )?(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  ];
  
  datePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      entities.push({
        entity: 'date',
        value: match[0].toLowerCase(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  });
  
  // Detect times (expanded patterns)
  const timePatterns = [
    /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/gi,
    /\b(\d{1,2}(?::\d{2})?\s*(?:o'clock))\b/gi,
    /\b(noon|midnight|morning|afternoon|evening|night)\b/gi,
    /\b(\d{1,2}(?::\d{2})?)\b/gi,
  ];
  
  timePatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (!/\d+\/\d+/.test(match[0])) { // Avoid matching dates like 10/30
        entities.push({
          entity: 'time',
          value: match[0].toLowerCase(),
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }
  });
  
  // Detect email addresses
  const emailPattern = /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g;
  let emailMatch;
  while ((emailMatch = emailPattern.exec(text)) !== null) {
    entities.push({
      entity: 'email',
      value: emailMatch[0],
      start: emailMatch.index,
      end: emailMatch.index + emailMatch[0].length,
    });
  }
  
  // Detect task content for reminders
  if (lowerText.includes('remind') || lowerText.includes('reminder') || lowerText.includes('schedule')) {
    // Look for content after "to" or "about" or between "me" and "at/on/tomorrow/etc"
    const taskPattern = /remind (?:me )?(?:to|about) ([^.,;!?]*)/i;
    const match = taskPattern.exec(text);
    if (match && match[1]) {
      const task = match[1].trim();
      const start = match.index + match[0].indexOf(task);
      entities.push({
        entity: 'task',
        value: task,
        start,
        end: start + task.length,
      });
    }
  }
  
  // Detect specific query for search
  if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look up')) {
    const queryPattern = /(?:search|find|look up|google) (?:for|about)? ([^.,;!?]*)/i;
    const match = queryPattern.exec(text);
    if (match && match[1]) {
      const query = match[1].trim();
      const start = match.index + match[0].indexOf(query);
      entities.push({
        entity: 'query',
        value: query,
        start,
        end: start + query.length,
      });
    }
  }

  // Detect meeting/event details
  if (lowerText.includes('schedule') || lowerText.includes('meeting') || lowerText.includes('calendar') || lowerText.includes('appointment')) {
    // Extract event title
    const eventPattern = /(?:schedule|add|create|set up) (?:a|an)? (meeting|call|appointment|event|reminder) (?:about|for|with)? ([^.,;!?]*)/i;
    const eventMatch = eventPattern.exec(text);
    if (eventMatch && eventMatch[2]) {
      const eventTitle = eventMatch[2].trim();
      entities.push({
        entity: 'event_title',
        value: eventTitle,
        start: eventMatch.index + eventMatch[0].indexOf(eventTitle),
        end: eventMatch.index + eventMatch[0].indexOf(eventTitle) + eventTitle.length,
      });
    }
    
    // Extract attendees
    const attendeesPattern = /(?:with|including) ([^.,;!?]*?)(?:on|at|tomorrow|next|this|in|\.|$)/i;
    const attendeesMatch = attendeesPattern.exec(text);
    if (attendeesMatch && attendeesMatch[1]) {
      const attendees = attendeesMatch[1].trim();
      entities.push({
        entity: 'attendees',
        value: attendees,
        start: attendeesMatch.index + attendeesMatch[0].indexOf(attendees),
        end: attendeesMatch.index + attendeesMatch[0].indexOf(attendees) + attendees.length,
      });
    }
  }
  
  return entities;
};

/**
 * Detect emotions in text
 */
const detectEmotions = (text: string): Emotion[] => {
  const emotions: Emotion[] = [];
  let highestConfidence = 0;
  let neutralConfidence = 0.2; // Default neutral confidence
  
  // Check for each emotion pattern
  for (const emotion of emotionPatterns) {
    let confidence = 0;
    let matches = 0;
    
    // Check each pattern for this emotion
    for (const pattern of emotion.patterns) {
      const patternMatches = (text.match(pattern) || []).length;
      if (patternMatches > 0) {
        matches += patternMatches;
        // Increase confidence with each match
        confidence = Math.min(0.9, confidence + 0.2 * patternMatches);
      }
    }
    
    if (confidence > 0) {
      emotions.push({
        type: emotion.type as Emotion['type'],
        confidence
      });
      
      // Track highest confidence for determining primary emotion
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
      }
    }
  }
  
  // If no strong emotions detected, add neutral with adjusted confidence
  if (highestConfidence < 0.4) {
    neutralConfidence = 0.6; // Stronger neutral if no other emotions are strong
  } else {
    neutralConfidence = Math.max(0.1, 0.4 - (highestConfidence * 0.2));
  }
  
  emotions.push({
    type: 'neutral',
    confidence: neutralConfidence
  });
  
  // Sort emotions by confidence (highest first)
  return emotions.sort((a, b) => b.confidence - a.confidence);
};

/**
 * Advanced intent analysis with improved confidence scoring and multi-intent detection
 */
export const analyzeIntent = (text: string): IntentResult => {
  const lowerText = text.toLowerCase();
  const intents: Intent[] = [];
  
  // Process each intent definition
  intentDefinitions.forEach(intent => {
    let maxConfidence = 0;
    let matchCount = 0;
    
    // Check each trigger word/phrase for this intent
    intent.triggers.forEach(trigger => {
      const triggerLower = trigger.toLowerCase();
      
      // Check for exact matches or partial matches
      if (lowerText === triggerLower) {
        // Exact match - highest confidence
        maxConfidence = Math.max(maxConfidence, 0.95);
        matchCount++;
      } else if (lowerText.includes(triggerLower)) {
        // Partial match - confidence based on relative length and position
        const triggerIndex = lowerText.indexOf(triggerLower);
        const isStandalone = (
          (triggerIndex === 0 || /\s/.test(lowerText[triggerIndex - 1])) &&
          (triggerIndex + triggerLower.length === lowerText.length || /[\s.,;!?]/.test(lowerText[triggerIndex + triggerLower.length]))
        );
        
        // Higher confidence for standalone words vs. partial word matches
        const confidenceScore = isStandalone 
          ? 0.7 + (triggerLower.length / text.length) * 0.25 // Standalone words
          : 0.3 + (triggerLower.length / text.length) * 0.2; // Partial matches
          
        // Adjust for trigger position (triggers at the start have higher weight)
        const positionMultiplier = 1 - (triggerIndex / lowerText.length) * 0.3;
        
        maxConfidence = Math.max(maxConfidence, confidenceScore * positionMultiplier);
        matchCount++;
      }
    });
    
    // Multiple trigger matches increase confidence
    if (matchCount > 1) {
      maxConfidence = Math.min(0.95, maxConfidence + (matchCount - 1) * 0.05);
    }
    
    // If we found any matches, add this intent to the results
    if (maxConfidence > 0) {
      intents.push({
        name: intent.name,
        confidence: maxConfidence,
      });
    }
  });
  
  // Sort intents by confidence (highest first)
  intents.sort((a, b) => b.confidence - a.confidence);
  
  // Detect entities
  const entities = detectEntities(text);
  
  // Detect emotions
  const emotions = detectEmotions(text);
  
  // Learn from this interaction
  learnPreference(text, entities);
  
  // If no intents were identified, use a fallback intent
  if (intents.length === 0) {
    intents.push({
      name: 'fallback',
      confidence: 1.0,
    });
  }
  
  return {
    text,
    intents,
    entities,
    emotions,
    topIntent: intents[0].name,
    primaryEmotion: emotions[0].type,
    contextualMemory: {
      recentTopics,
      userPreferences
    }
  };
};
