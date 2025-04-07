
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { analyzeIntent, IntentResult } from '@/utils/intentService';
import { TTSOptions, preloadVoices } from '@/utils/ttsService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bella';
  timestamp: Date;
  intentResult?: IntentResult;
}

interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused';
  ttsOptions: TTSOptions;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
}

const BellaContext = createContext<BellaContextType | undefined>(undefined);

// Enhanced responses for a more premium, helpful experience
const premiumResponses = [
  "I'm Bella, your premium AI assistant. I'm designed to be helpful, informative, and engaging. How can I assist you today?",
  "The current weather shows clear skies with a temperature of 73°F. It's a beautiful day with a gentle breeze from the southwest at 5 mph. The forecast predicts similar conditions for the next 24 hours.",
  "I've set that reminder for you. You'll receive a notification at the specified time. Is there anything else you'd like me to add to the reminder?",
  "I've found several relevant results for your query. Would you like me to summarize the key points or would you prefer more detailed information on a specific aspect?",
  "I'm constantly learning and evolving. While I strive to be helpful, there might be topics where my knowledge is limited. Please feel free to ask for clarification or rephrase your question.",
  "Is there anything specific you'd like to know or discuss? I'm here to assist with information, tasks, or just conversation.",
];

const getEnhancedResponse = () => {
  return premiumResponses[Math.floor(Math.random() * premiumResponses.length)];
};

// Enhanced intent-based responses for a more helpful and natural experience
const getIntentBasedResponse = (intentResult: IntentResult): string => {
  const { topIntent, entities, text } = intentResult;
  
  switch (topIntent) {
    case 'greeting':
      const timeOfDay = new Date().getHours();
      let greeting = "Hello";
      
      if (timeOfDay < 12) greeting = "Good morning";
      else if (timeOfDay < 18) greeting = "Good afternoon";
      else greeting = "Good evening";
      
      return `${greeting}! I'm Bella, your premium AI assistant. I'm designed to help with information, tasks, and conversation. How can I make your day better?`;
    
    case 'weather':
      const locations = entities.filter(e => e.entity === 'location');
      const weatherLocation = locations.length > 0 ? locations[0].value : 'your location';
      
      return `Based on the latest data for ${weatherLocation}, it's currently 72°F with clear skies. The forecast shows a high of 78°F with a 5% chance of precipitation. Would you like more detailed weather information or a forecast for the coming days?`;
    
    case 'reminder':
      let reminderResponse = "I'll set that reminder for you.";
      
      // Check for time/date entities
      const timeEntity = entities.find(e => e.entity === 'time');
      const dateEntity = entities.find(e => e.entity === 'date');
      const taskEntity = entities.find(e => e.entity === 'task');
      
      if (timeEntity && dateEntity) {
        reminderResponse = `I've set a reminder for ${dateEntity.value} at ${timeEntity.value}.`;
      } else if (timeEntity) {
        reminderResponse = `I've set a reminder for today at ${timeEntity.value}.`;
      } else if (dateEntity) {
        reminderResponse = `I've set a reminder for ${dateEntity.value}.`;
      }
      
      if (taskEntity) {
        reminderResponse += ` I'll remind you to "${taskEntity.value}".`;
      }
      
      return reminderResponse + " Is there anything else you'd like me to remind you about or any details you'd like to add?";
    
    case 'search':
      // Detect the search topic for a more personalized response
      const searchTopic = text.replace(/search for|find|look up|google|information about/gi, '').trim();
      if (searchTopic) {
        return `I've found some information about "${searchTopic}". Would you like me to summarize the key points or would you prefer more detailed information?`;
      }
      return "I've searched for that information. Would you like me to provide a summary or more specific details on a particular aspect?";
    
    case 'help':
      return "I'm here to assist you with a wide range of tasks and questions. I can help with weather updates, setting reminders, answering questions, providing recommendations, or just having a conversation. What specifically would you like help with today?";
    
    case 'joke':
      const premiumJokes = [
        "Why did the AI assistant go to art school? To learn how to draw better conclusions!",
        "What do you call an AI that sings? Artificial Harmonies!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Why did the computer go to therapy? It had too many bytes of emotional baggage!",
        "How does a penguin build its house? Igloos it together!"
      ];
      return premiumJokes[Math.floor(Math.random() * premiumJokes.length)];
    
    case 'farewell':
      const farewellResponses = [
        "Goodbye! It was a pleasure assisting you. Feel free to return whenever you need help!",
        "Until next time! If you have any more questions later, I'll be here to help.",
        "Take care! Looking forward to our next conversation.",
        "Farewell! Don't hesitate to reach out again if you need assistance."
      ];
      return farewellResponses[Math.floor(Math.random() * farewellResponses.length)];
    
    case 'gratitude':
      const gratitudeResponses = [
        "You're very welcome! It's my pleasure to assist you.",
        "Happy to help! Is there anything else you'd like to know?",
        "Glad I could be of assistance! Don't hesitate to ask if you need anything else.",
        "My pleasure! I'm here whenever you need help."
      ];
      return gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
      
    default:
      return getEnhancedResponse();
  }
};

export const BellaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hi there! I'm Bella, your premium AI assistant. How can I help you today?",
      sender: 'bella',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [mood, setMood] = useState<'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused'>('neutral');
  const [ttsOptions, setTTSOptions] = useState<TTSOptions>({
    voice: 'bella_premium',
    pitch: 1.1,
    rate: 1.0,
    volume: 0.7,
    enhancedQuality: true,
  });
  const { toast } = useToast();
  
  // Preload voices when context is first created
  useEffect(() => {
    preloadVoices().catch(err => {
      console.error('Failed to preload voices:', err);
    });
  }, []);
  
  const determineMood = (intentResult: IntentResult): 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused' => {
    const { topIntent, text } = intentResult;
    
    // Enhanced mood detection for more natural responses
    switch (topIntent) {
      case 'greeting':
        return 'happy';
      case 'joke':
        return 'excited';
      case 'farewell':
        return 'happy';
      case 'gratitude':
        return 'happy';
      case 'help':
        return 'concerned';
      case 'search':
        return 'thinking';
      case 'reminder':
        return 'thinking';
      case 'weather':
        return 'neutral';
      default:
        // For other intents, check for question marks or keywords
        if (text.includes('?')) return 'curious';
        if (text.toLowerCase().includes('how') || 
            text.toLowerCase().includes('why') || 
            text.toLowerCase().includes('what')) return 'thinking';
        if (text.toLowerCase().includes('wow') || 
            text.toLowerCase().includes('amazing') || 
            text.toLowerCase().includes('awesome') ||
            text.toLowerCase().includes('great')) return 'excited';
        if (text.toLowerCase().includes('confused') || 
            text.toLowerCase().includes('i don\'t understand') || 
            text.toLowerCase().includes('what do you mean')) return 'confused';
        if (text.toLowerCase().includes('worried') || 
            text.toLowerCase().includes('concerned') || 
            text.toLowerCase().includes('problem')) return 'concerned';
        return 'neutral';
    }
  };
  
  const sendMessage = useCallback((content: string) => {
    // Process the message with intent recognition
    const intentResult = analyzeIntent(content);
    
    // Add user message
    const newUserMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date(),
      intentResult
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsThinking(true);
    
    // Determine mood based on intent analysis
    const newMood = determineMood(intentResult);
    setMood(newMood);
    
    // Simulate variable thinking time based on complexity of the query
    const baseTime = 1000; // Base minimum time
    const wordCount = content.split(/\s+/).length;
    const complexityFactor = Math.min(wordCount / 5, 3); // Cap at 3 seconds additional time
    const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
    
    setTimeout(() => {
      setIsThinking(false);
      setIsTalking(true);
      
      // Get an enhanced response based on the intent
      const responseContent = getIntentBasedResponse(intentResult);
      
      // Add Bella's response
      const newBellaMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        sender: 'bella',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBellaMessage]);
      
      // Simulate speech time with more natural variation
      // Calculate speaking duration based on word count and natural pauses
      const responseWords = responseContent.split(/\s+/).length;
      const wordsPerSecond = 2.5; // Average speaking speed
      const punctuationCount = (responseContent.match(/[.,;:!?]/g) || []).length;
      const pauseTime = punctuationCount * 0.2; // 200ms pause per punctuation
      
      const speakingTime = (responseWords / wordsPerSecond) * 1000 + pauseTime * 1000;
      
      setTimeout(() => {
        setIsTalking(false);
        // Don't reset mood immediately for a more natural experience
        setTimeout(() => {
          setMood('neutral');
        }, 2000);
      }, speakingTime);
    }, responseTime);
  }, []);
  
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: uuidv4(),
        content: "Hi there! I'm Bella, your premium AI assistant. How can I help you today?",
        sender: 'bella',
        timestamp: new Date()
      }
    ]);
    
    toast({
      title: "Conversation cleared",
      description: "All previous messages have been cleared.",
    });
  }, [toast]);
  
  const updateTTSOptions = useCallback((options: Partial<TTSOptions>) => {
    setTTSOptions(prev => ({
      ...prev,
      ...options
    }));
  }, []);
  
  return (
    <BellaContext.Provider value={{
      messages,
      isThinking,
      isTalking,
      mood,
      ttsOptions,
      sendMessage,
      clearMessages,
      updateTTSOptions
    }}>
      {children}
    </BellaContext.Provider>
  );
};

export const useBella = () => {
  const context = useContext(BellaContext);
  if (context === undefined) {
    throw new Error('useBella must be used within a BellaProvider');
  }
  return context;
};
