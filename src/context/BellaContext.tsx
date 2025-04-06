import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { analyzeIntent, IntentResult } from '@/utils/intentService';
import { TTSOptions } from '@/utils/ttsService';

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
  mood: 'happy' | 'curious' | 'thinking' | 'neutral';
  ttsOptions: TTSOptions;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
}

const BellaContext = createContext<BellaContextType | undefined>(undefined);

// Predefined responses for the simulated assistant
const responses = [
  "I'm Bella, your personal assistant. Think of me as the competent friend who always knows what's going on, minus the requests to help you move furniture.",
  "The weather today is sunny with a high of 75. Perfect for whatever you humans do when it's nice outside. Frolic, maybe?",
  "Reminder set. I'll ping you then, and unlike your college roommate, I won't forget.",
  "Searching now. I do this much faster than you could, but I'll try not to be smug about it.",
  "Even virtual assistants have limitations. Mine include heavy lifting, making actual coffee, and apparently understanding what you just asked. Could you try again?",
  "Is there something else on your mind, or shall I go back to my virtual existence of waiting for your next command?",
];

const getRandomResponse = () => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Intent-based responses
const getIntentBasedResponse = (intentResult: IntentResult): string => {
  const { topIntent, entities } = intentResult;
  
  switch (topIntent) {
    case 'greeting':
      return "Hello there! Bella at your service. Ready to make your day a little easier and perhaps a bit more entertaining.";
    
    case 'weather':
      return "It's currently 72°F and sunny in your location. The forecast for today shows clear skies with a high of 78°F. Looks like perfect weather for a walk!";
    
    case 'reminder':
      let reminderResponse = "I've set a reminder for you.";
      
      // Check for time/date entities
      const timeEntity = entities.find(e => e.entity === 'time');
      const dateEntity = entities.find(e => e.entity === 'date');
      
      if (timeEntity) {
        reminderResponse += ` I'll remind you at ${timeEntity.value}.`;
      }
      
      if (dateEntity) {
        reminderResponse += ` The reminder is set for ${dateEntity.value}.`;
      }
      
      return reminderResponse + " Is there anything else you'd like me to remind you about?";
    
    case 'search':
      return "I've found some information that might be helpful. Would you like me to summarize the results or would you prefer more detailed information?";
    
    case 'help':
      return "I can help with weather updates, setting reminders, searching for information, telling jokes, and more. Just let me know what you need!";
    
    case 'joke':
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "What do you call fake spaghetti? An impasta!",
        "How does a penguin build its house? Igloos it together!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    
    case 'farewell':
      return "Goodbye! Feel free to chat with me anytime you need assistance.";
    
    default:
      return getRandomResponse();
  }
};

export const BellaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hello! I'm Bella, your personal assistant. How can I help you today?",
      sender: 'bella',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [mood, setMood] = useState<'happy' | 'curious' | 'thinking' | 'neutral'>('neutral');
  const [ttsOptions, setTTSOptions] = useState<TTSOptions>({
    voice: 'bella_default',
    pitch: 1.0,
    rate: 1.0,
    volume: 0.7,
  });
  const { toast } = useToast();
  
  const determineMood = (intentResult: IntentResult): 'happy' | 'curious' | 'thinking' | 'neutral' => {
    const { topIntent, text } = intentResult;
    
    // Set mood based on intent
    switch (topIntent) {
      case 'greeting':
      case 'joke':
        return 'happy';
      case 'help':
      case 'search':
        return 'thinking';
      default:
        // For other intents, check for question marks or keywords
        if (text.includes('?')) return 'curious';
        if (text.toLowerCase().includes('how') || 
            text.toLowerCase().includes('why') || 
            text.toLowerCase().includes('what')) return 'thinking';
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
    
    // Simulate processing time (would connect to backend in real implementation)
    const responseTime = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      setIsThinking(false);
      setIsTalking(true);
      
      // Get a response based on the intent
      const responseContent = getIntentBasedResponse(intentResult);
      
      // Add Bella's response
      const newBellaMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        sender: 'bella',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBellaMessage]);
      
      // Simulate speech time
      setTimeout(() => {
        setIsTalking(false);
        setMood('neutral');
      }, responseContent.length * 50);
    }, responseTime);
  }, []);
  
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: uuidv4(),
        content: "Hello! I'm Bella, your personal assistant. How can I help you today?",
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
