
/**
 * Enhanced intent recognition service for Bella
 * This provides sophisticated natural language understanding
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

export interface IntentResult {
  text: string;
  intents: Intent[];
  entities: Entity[];
  topIntent: string;
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
];

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
  
  return entities;
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
    topIntent: intents[0].name,
  };
};
