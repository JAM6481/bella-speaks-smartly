
import { BellaMood } from '@/types/bella';

interface EmotionalResponse {
  tone: string;
  expressiveness: number;
  empathy: number;
}

// Enhanced emotional intelligence to adjust responses based on user's emotional state
export const getEmotionalResponse = (
  userMessage: string, 
  userContext: any, 
  currentMood: BellaMood
): EmotionalResponse => {
  // Default emotional response configuration
  const defaultResponse: EmotionalResponse = {
    tone: 'neutral',
    expressiveness: 0.5,
    empathy: 0.5
  };
  
  // Check for emotional indicators in the user message
  const lowerMessage = userMessage.toLowerCase();
  
  // Detect frustration or negative emotions
  if (
    lowerMessage.includes('frustrated') || 
    lowerMessage.includes('angry') || 
    lowerMessage.includes('upset') ||
    lowerMessage.includes('annoyed') ||
    lowerMessage.includes('disappointed')
  ) {
    return {
      tone: 'empathetic',
      expressiveness: 0.3, // More subdued to avoid escalation
      empathy: 0.9 // High empathy for frustrated users
    };
  }
  
  // Detect excitement or positive emotions
  if (
    lowerMessage.includes('excited') || 
    lowerMessage.includes('happy') || 
    lowerMessage.includes('great') ||
    lowerMessage.includes('love it') ||
    lowerMessage.includes('amazing')
  ) {
    return {
      tone: 'enthusiastic',
      expressiveness: 0.8, // More expressive to match excitement
      empathy: 0.7 // High empathy to share in the positive emotion
    };
  }
  
  // Detect confusion
  if (
    lowerMessage.includes('confused') || 
    lowerMessage.includes('don\'t understand') || 
    lowerMessage.includes('what do you mean') ||
    lowerMessage.includes('unclear')
  ) {
    return {
      tone: 'clarifying',
      expressiveness: 0.4, // Calm, measured response
      empathy: 0.6 // Empathetic but focused on clarity
    };
  }
  
  // Detect urgency
  if (
    lowerMessage.includes('urgent') || 
    lowerMessage.includes('quickly') || 
    lowerMessage.includes('asap') ||
    lowerMessage.includes('emergency')
  ) {
    return {
      tone: 'efficient',
      expressiveness: 0.5, // Balanced but direct
      empathy: 0.3 // Lower empathy to focus on results
    };
  }
  
  // Match current mood if no specific emotional indicators detected
  switch (currentMood) {
    case 'happy':
      return { tone: 'positive', expressiveness: 0.7, empathy: 0.6 };
    case 'concerned':
      return { tone: 'supportive', expressiveness: 0.4, empathy: 0.8 };
    case 'confused':
      return { tone: 'clarifying', expressiveness: 0.5, empathy: 0.6 };
    case 'curious':
      return { tone: 'engaging', expressiveness: 0.6, empathy: 0.5 };
    case 'thinking':
      return { tone: 'thoughtful', expressiveness: 0.4, empathy: 0.5 };
    case 'excited':
      return { tone: 'enthusiastic', expressiveness: 0.8, empathy: 0.7 };
    case 'surprised':
      return { tone: 'intrigued', expressiveness: 0.7, empathy: 0.6 };
    case 'neutral':
    default:
      return defaultResponse;
  }
};

// Apply emotional intelligence to adjust message content
export const enhanceMessageWithEQ = (
  message: string,
  emotionalResponse: EmotionalResponse
): string => {
  // Don't modify empty messages
  if (!message.trim()) return message;
  
  // Adjust message based on tone
  let enhancedMessage = message;
  
  // For high empathy messages, add empathetic phrases if appropriate
  if (emotionalResponse.empathy > 0.7 && !message.includes("I understand")) {
    // Only for longer messages to avoid awkward short responses
    if (message.length > 100) {
      const empathyPhrases = [
        "I understand how you feel. ",
        "I can see why you'd feel that way. ",
        "That makes a lot of sense. "
      ];
      
      // Add at beginning if the message doesn't already start with a similar phrase
      const lowerStart = message.substring(0, 30).toLowerCase();
      if (!lowerStart.includes("understand") && !lowerStart.includes("see why")) {
        const randomPhrase = empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
        enhancedMessage = randomPhrase + enhancedMessage;
      }
    }
  }
  
  // For high expressiveness, add appropriate emphasis
  if (emotionalResponse.expressiveness > 0.7) {
    // Replace neutral language with more expressive alternatives
    enhancedMessage = enhancedMessage
      .replace(/good\b/g, "excellent")
      .replace(/nice\b/g, "wonderful")
      .replace(/like\b/g, "love");
    
    // For enthusiastic tone, potentially add an exclamation point if message ends with period
    if (emotionalResponse.tone === 'enthusiastic' && enhancedMessage.endsWith('.')) {
      enhancedMessage = enhancedMessage.slice(0, -1) + '!';
    }
  }
  
  return enhancedMessage;
};
