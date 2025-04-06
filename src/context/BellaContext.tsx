
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bella';
  timestamp: Date;
}

interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: 'happy' | 'curious' | 'thinking' | 'neutral';
  sendMessage: (content: string) => void;
  clearMessages: () => void;
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

const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny'];
const reminderKeywords = ['remind', 'reminder', 'schedule', 'appointment', 'calendar'];
const searchKeywords = ['search', 'find', 'look up', 'google', 'information'];

const getContextualResponse = (message: string) => {
  const lowerMessage = message.toLowerCase();
  
  if (weatherKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "It's currently 72°F and sunny in your location. The forecast for today shows clear skies with a high of 78°F. Looks like perfect weather for a walk!";
  }
  
  if (reminderKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "I've set a reminder for you. I'll make sure to notify you at the specified time. Is there anything else you'd like me to remind you about?";
  }
  
  if (searchKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return "I've found some information that might be helpful. Would you like me to summarize the results or would you prefer more detailed information?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello there! Bella at your service. Ready to make your day a little easier and perhaps a bit more entertaining.";
  }
  
  return getRandomResponse();
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
  const { toast } = useToast();
  
  const determineMood = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('?')) return 'curious';
    if (lowerMessage.includes('weather') || lowerMessage.includes('nice') || lowerMessage.includes('good')) return 'happy';
    if (lowerMessage.includes('think') || lowerMessage.includes('how') || lowerMessage.includes('why')) return 'thinking';
    
    return 'neutral';
  };
  
  const sendMessage = useCallback((content: string) => {
    // Add user message
    const newUserMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsThinking(true);
    
    // Determine mood based on message content
    const newMood = determineMood(content);
    setMood(newMood);
    
    // Simulate processing time (would connect to backend in real implementation)
    const responseTime = Math.random() * 2000 + 1000;
    
    setTimeout(() => {
      setIsThinking(false);
      setIsTalking(true);
      
      // Get a response based on the message content
      const responseContent = getContextualResponse(content);
      
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
  
  return (
    <BellaContext.Provider value={{
      messages,
      isThinking,
      isTalking,
      mood,
      sendMessage,
      clearMessages
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
