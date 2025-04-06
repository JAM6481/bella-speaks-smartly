
/**
 * Simple intent recognition service for Bella
 * This provides basic Rasa-like functionality for identifying user intents
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

// Define basic intents with their trigger keywords
const intentDefinitions = [
  {
    name: 'greeting',
    triggers: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
  },
  {
    name: 'weather',
    triggers: ['weather', 'forecast', 'temperature', 'rain', 'sunny', 'cloudy'],
  },
  {
    name: 'reminder',
    triggers: ['remind', 'reminder', 'schedule', 'appointment', 'remember', 'calendar'],
  },
  {
    name: 'search',
    triggers: ['search', 'find', 'look up', 'google', 'information'],
  },
  {
    name: 'help',
    triggers: ['help', 'assist', 'support', 'guide'],
  },
  {
    name: 'joke',
    triggers: ['joke', 'funny', 'humor', 'laugh'],
  },
  {
    name: 'farewell',
    triggers: ['bye', 'goodbye', 'see you', 'later', 'farewell'],
  },
];

/**
 * Detect entities in the user message
 * Simple implementation - in production this would use a more sophisticated approach
 */
const detectEntities = (text: string): Entity[] => {
  const entities: Entity[] = [];
  
  // Detect dates (very simple implementation)
  const dateMatches = text.match(/\b(today|tomorrow|yesterday|next week|next month)\b/gi);
  if (dateMatches) {
    dateMatches.forEach(match => {
      const start = text.toLowerCase().indexOf(match.toLowerCase());
      entities.push({
        entity: 'date',
        value: match.toLowerCase(),
        start,
        end: start + match.length,
      });
    });
  }
  
  // Detect times (very simple implementation)
  const timeMatches = text.match(/\b([0-9]{1,2}(:[0-9]{2})?\s*(am|pm)?)\b/gi);
  if (timeMatches) {
    timeMatches.forEach(match => {
      const start = text.toLowerCase().indexOf(match.toLowerCase());
      entities.push({
        entity: 'time',
        value: match.toLowerCase(),
        start,
        end: start + match.length,
      });
    });
  }
  
  return entities;
};

/**
 * Analyze text to determine user intent
 * This is a simplified version of what Rasa would do
 */
export const analyzeIntent = (text: string): IntentResult => {
  const lowerText = text.toLowerCase();
  const intents: Intent[] = [];
  
  // Calculate confidence for each intent based on trigger word matches
  intentDefinitions.forEach(intent => {
    let maxConfidence = 0;
    
    // Check each trigger word/phrase for this intent
    intent.triggers.forEach(trigger => {
      if (lowerText.includes(trigger.toLowerCase())) {
        // Simple confidence calculation based on how much of the text is the trigger
        const confidence = trigger.length / text.length;
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    });
    
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
