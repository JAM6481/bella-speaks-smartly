
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { analyzeIntent, IntentResult } from '@/utils/intentService';
import { TTSOptions, preloadVoices } from '@/utils/ttsService';
import { 
  AIProvider, 
  AIProviderSettings, 
  defaultAISettings,
  getModelById
} from '@/utils/aiProviders';

// Define integrations
export type IntegrationType = 'googleCalendar' | 'googleContacts' | 'gmail' | 'outlookEmail';

export interface Integration {
  type: IntegrationType;
  isConnected: boolean;
  lastSynced?: Date;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bella';
  timestamp: Date;
  intentResult?: IntentResult;
}

export interface UserPreference {
  key: string;
  value: string | number | boolean;
  timestamp: Date;
}

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused';
  ttsOptions: TTSOptions;
  aiSettings: AIProviderSettings;
  activeProvider: AIProvider;
  integrations: Record<IntegrationType, Integration>;
  userPreferences: UserPreference[];
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: AIProvider, settings: Partial<AIProviderSettings[keyof AIProviderSettings]>) => void;
  setActiveProvider: (provider: AIProvider) => void;
  connectIntegration: (type: IntegrationType) => Promise<boolean>;
  disconnectIntegration: (type: IntegrationType) => void;
  addUserPreference: (key: string, value: string | number | boolean) => void;
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
  const { topIntent, entities, text, primaryEmotion, contextualMemory } = intentResult;
  const userPreferences = contextualMemory?.userPreferences || {};
  const recentTopics = contextualMemory?.recentTopics || [];
  
  // Personalization based on user preferences and context
  let personalizedPrefix = "";
  if (Object.keys(userPreferences).length > 0) {
    if (userPreferences.like && Math.random() > 0.7) {
      personalizedPrefix = `Since you like ${userPreferences.like}, I thought you might appreciate this: `;
    } else if (userPreferences.favorite_color && Math.random() > 0.8) {
      personalizedPrefix = `I remember your favorite color is ${userPreferences.favorite_color}. `;
    }
  }
  
  // Reference to recent topics for conversational continuity
  let topicReference = "";
  if (recentTopics.length > 1 && Math.random() > 0.8) {
    topicReference = `Going back to our conversation about ${recentTopics[1]}, `;
  }
  
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
      
      return `${personalizedPrefix}Based on the latest data for ${weatherLocation}, it's currently 72°F with clear skies. The forecast shows a high of 78°F with a 5% chance of precipitation. Would you like more detailed weather information or a forecast for the coming days?`;
    
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
    
    case 'calendar':
      const eventTitle = entities.find(e => e.entity === 'event_title');
      const eventDate = entities.find(e => e.entity === 'date');
      const eventTime = entities.find(e => e.entity === 'time');
      const attendees = entities.find(e => e.entity === 'attendees');
      
      if (eventTitle) {
        let calendarResponse = `I'll add "${eventTitle.value}" to your calendar`;
        
        if (eventDate && eventTime) {
          calendarResponse += ` on ${eventDate.value} at ${eventTime.value}`;
        } else if (eventDate) {
          calendarResponse += ` on ${eventDate.value}`;
        } else if (eventTime) {
          calendarResponse += ` at ${eventTime.value} today`;
        }
        
        if (attendees) {
          calendarResponse += ` with ${attendees.value}`;
        }
        
        return `${calendarResponse}. Would you like me to set a reminder for this event as well?`;
      }
      
      return "I can help you manage your calendar. Would you like to add an event, check your schedule, or sync with your Google Calendar?";
    
    case 'email':
      const emailEntity = entities.find(e => e.entity === 'email');
      
      if (text.toLowerCase().includes('check') || text.toLowerCase().includes('read')) {
        return `${topicReference}I can check your emails for you. Would you like me to show your most recent unread messages?`;
      } else if (text.toLowerCase().includes('send') || text.toLowerCase().includes('write') || text.toLowerCase().includes('compose')) {
        let emailResponse = "I can help you compose an email";
        
        if (emailEntity) {
          emailResponse += ` to ${emailEntity.value}`;
        }
        
        return `${emailResponse}. What would you like the subject and content to be?`;
      }
      
      return "I can help you with your emails. Would you like to check your inbox or compose a new message?";
    
    case 'contacts':
      if (text.toLowerCase().includes('find') || text.toLowerCase().includes('search')) {
        return "I can search your contacts for you. Who would you like to find?";
      } else if (text.toLowerCase().includes('add')) {
        return "I can help you add a new contact. Please provide the name and contact information.";
      }
      
      return "I can help you manage your contacts. Would you like to search for someone, add a new contact, or view your recent contacts?";
    
    case 'search':
      // Detect the search topic for a more personalized response
      const searchTopic = text.replace(/search for|find|look up|google|information about/gi, '').trim();
      if (searchTopic) {
        return `${personalizedPrefix}I've found some information about "${searchTopic}". Would you like me to summarize the key points or would you prefer more detailed information?`;
      }
      return "I've searched for that information. Would you like me to provide a summary or more specific details on a particular aspect?";
    
    case 'help':
      return `${topicReference}I'm here to assist you with a wide range of tasks and questions. I can help with weather updates, setting reminders, answering questions, providing recommendations, managing your calendar, checking emails, or just having a conversation. What specifically would you like help with today?`;
    
    case 'learning_preference':
      return "Thank you for sharing that preference with me. I'll remember it for future interactions to provide you with more personalized assistance.";
    
    case 'joke':
      const premiumJokes = [
        "Why did the AI assistant go to art school? To learn how to draw better conclusions!",
        "What do you call an AI that sings? Artificial Harmonies!",
        "Why don't scientists trust atoms? Because they make up everything!",
        "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!",
        "Why did the computer go to therapy? It had too many bytes of emotional baggage!",
        "How does a penguin build its house? Igloos it together!"
      ];
      return `${personalizedPrefix}${premiumJokes[Math.floor(Math.random() * premiumJokes.length)]}`;
    
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
      return `${gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)]}`;
      
    default:
      return `${personalizedPrefix}${topicReference}${getEnhancedResponse()}`;
  }
};

// Mock functions for integration (in a real app, these would connect to actual services)
const mockConnectIntegration = async (type: IntegrationType): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
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
  const [aiSettings, setAISettings] = useState<AIProviderSettings>(defaultAISettings);
  const [activeProvider, setActiveProvider] = useState<AIProvider>('openrouter');
  const [integrations, setIntegrations] = useState<Record<IntegrationType, Integration>>({
    googleCalendar: { type: 'googleCalendar', isConnected: false },
    googleContacts: { type: 'googleContacts', isConnected: false },
    gmail: { type: 'gmail', isConnected: false },
    outlookEmail: { type: 'outlookEmail', isConnected: false }
  });
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const { toast } = useToast();
  
  // Preload voices when context is first created
  useEffect(() => {
    preloadVoices().catch(err => {
      console.error('Failed to preload voices:', err);
    });
  }, []);
  
  const determineMood = (intentResult: IntentResult): 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused' => {
    // Use the detected primary emotion if available
    if (intentResult.primaryEmotion) {
      switch (intentResult.primaryEmotion) {
        case 'happy': return 'happy';
        case 'sad': return 'concerned';
        case 'angry': return 'concerned';
        case 'surprised': return 'surprised';
        case 'confused': return 'confused';
        case 'neutral': return 'neutral';
        case 'excited': return 'excited';
        case 'concerned': return 'concerned';
      }
    }
    
    // Fallback to intent-based mood determination
    const { topIntent, text } = intentResult;
    
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
      case 'calendar':
        return 'thinking';
      case 'weather':
        return 'neutral';
      case 'email':
      case 'contacts':
        return 'thinking';
      case 'learning_preference':
        return 'happy';
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
  
  const connectIntegration = useCallback(async (type: IntegrationType) => {
    try {
      setIsThinking(true);
      const success = await mockConnectIntegration(type);
      
      if (success) {
        setIntegrations(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            isConnected: true,
            lastSynced: new Date()
          }
        }));
        
        toast({
          title: `${type} connected`,
          description: `Successfully connected to ${type}`,
        });
        
        return true;
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error(`Failed to connect ${type}:`, error);
      
      toast({
        title: `${type} connection failed`,
        description: "There was an error connecting to the service. Please try again.",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsThinking(false);
    }
  }, [toast]);
  
  const disconnectIntegration = useCallback((type: IntegrationType) => {
    setIntegrations(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isConnected: false,
        lastSynced: undefined
      }
    }));
    
    toast({
      title: `${type} disconnected`,
      description: `Successfully disconnected from ${type}`,
    });
  }, [toast]);
  
  const addUserPreference = useCallback((key: string, value: string | number | boolean) => {
    setUserPreferences(prev => {
      // Check if preference already exists
      const existingIndex = prev.findIndex(p => p.key === key);
      
      if (existingIndex >= 0) {
        // Update existing preference
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          value,
          timestamp: new Date()
        };
        return updated;
      } else {
        // Add new preference
        return [...prev, {
          key,
          value,
          timestamp: new Date()
        }];
      }
    });
  }, []);
  
  const sendMessage = useCallback(async (content: string) => {
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
    
    // Extract and learn user preferences
    if (intentResult.contextualMemory?.userPreferences) {
      const preferences = intentResult.contextualMemory.userPreferences;
      
      // Store detected preferences
      Object.entries(preferences).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          addUserPreference(key, value);
        }
      });
    }
    
    // Get the model information
    let responseContent = '';
    
    try {
      if (activeProvider === 'openrouter' && aiSettings.openRouter.apiKey) {
        // In a real app, this would call an edge function to protect the API key
        const modelInfo = getModelById(aiSettings.openRouter.selectedModel);
        
        console.log(`Using OpenRouter with model: ${modelInfo?.name || aiSettings.openRouter.selectedModel}`);
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        // For demo purposes, get a canned response
        responseContent = getIntentBasedResponse(intentResult);
      } else if (activeProvider === 'n8n' && aiSettings.n8n.webhookUrl) {
        // In a real app, this would call the n8n webhook
        console.log(`Using n8n workflow: ${aiSettings.n8n.selectedWorkflow}`);
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        // For demo purposes, get a canned response
        responseContent = getIntentBasedResponse(intentResult);
      } else {
        // Fallback to default responses
        console.log('Using built-in response generator');
        
        // Simulate variable thinking time based on complexity of the query
        const baseTime = 1000; // Base minimum time
        const wordCount = content.split(/\s+/).length;
        const complexityFactor = Math.min(wordCount / 5, 3); // Cap at 3 seconds additional time
        const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
        
        await new Promise(resolve => setTimeout(resolve, responseTime));
        responseContent = getIntentBasedResponse(intentResult);
      }
      
      // Check for integration-specific actions
      if (intentResult.topIntent === 'calendar' && intentResult.entities.find(e => e.entity === 'event_title')) {
        // If calendar action detected but not connected
        if (!integrations.googleCalendar.isConnected) {
          responseContent += "\n\nIt looks like you haven't connected your Google Calendar yet. Would you like to connect it now?";
        }
      } else if (intentResult.topIntent === 'email' && !integrations.gmail.isConnected && !integrations.outlookEmail.isConnected) {
        responseContent += "\n\nIt seems you haven't connected any email accounts. Would you like to connect Gmail or Outlook?";
      } else if (intentResult.topIntent === 'contacts' && !integrations.googleContacts.isConnected) {
        responseContent += "\n\nI notice you haven't connected Google Contacts. Would you like to connect it to manage your contacts more effectively?";
      }
    } catch (error) {
      console.error('Error generating response:', error);
      responseContent = "I'm sorry, I encountered an error processing your request. Please try again later.";
      
      toast({
        title: "Error",
        description: "Failed to generate response. Please check your settings and try again.",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
      setIsTalking(true);
      
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
    }
  }, [activeProvider, aiSettings, determineMood, toast, integrations, addUserPreference]);
  
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
  
  const updateAISettings = useCallback((provider: AIProvider, settings: Partial<AIProviderSettings[keyof AIProviderSettings]>) => {
    setAISettings(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider] as any),
        ...settings
      }
    }));
    
    toast({
      title: `${provider === 'openrouter' ? 'OpenRouter' : 'n8n'} settings updated`,
      description: "Your AI provider settings have been updated.",
    });
  }, [toast]);
  
  return (
    <BellaContext.Provider value={{
      messages,
      isThinking,
      isTalking,
      mood,
      ttsOptions,
      aiSettings,
      activeProvider,
      integrations,
      userPreferences,
      sendMessage,
      clearMessages,
      updateTTSOptions,
      updateAISettings,
      setActiveProvider,
      connectIntegration,
      disconnectIntegration,
      addUserPreference
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
