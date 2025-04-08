
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { analyzeIntent } from '@/utils/intentService';
import { TTSOptions, preloadVoices } from '@/utils/ttsService';
import { 
  AIProvider,
  AISettings, 
  defaultAISettings,
  getModelById
} from '@/utils/aiProviders';
import { mockConnectIntegration, saveGoogleAPISettings, getGoogleAPISettings, GoogleAPISettings } from '@/utils/integrationUtils';
import { getIntentBasedResponse } from '@/utils/responseGenerator';
import { determineMood } from '@/utils/moodUtils';
import type { 
  Message, 
  UserPreference, 
  IntegrationType, 
  Integration, 
  BellaMood, 
  AgentType, 
  OfflineAgent, 
  IntentResult,
  Integrations
} from '@/types/bella';

// Re-export types properly
export type { IntegrationType } from '@/types/bella';

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: BellaMood;
  ttsOptions: TTSOptions;
  aiSettings: AISettings;
  googleAPISettings: GoogleAPISettings;
  activeProvider: keyof AISettings;
  integrations: Integrations;
  userPreferences: UserPreference[];
  offlineAgents: OfflineAgent[];
  activeAgent: AgentType;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: keyof AISettings, settings: Partial<AISettings[keyof AISettings]>) => void;
  updateGoogleAPISettings: (settings: Partial<GoogleAPISettings>) => void;
  setActiveProvider: (provider: keyof AISettings) => void;
  connectIntegration: (type: IntegrationType) => Promise<boolean>;
  disconnectIntegration: (type: IntegrationType) => void;
  addUserPreference: (key: string, value: string | number | boolean) => void;
  setActiveAgent: (agentType: AgentType) => void;
}

const BellaContext = createContext<BellaContextType | undefined>(undefined);

export const BellaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      content: "Hi there! I'm Bella, your premium AI assistant. How can I help you today?",
      isUser: false,
      sender: 'bella',
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [mood, setMood] = useState<BellaMood>('neutral');
  
  // Enhanced TTS options for a more confident, articulate U.S. female voice in her mid-20s
  const [ttsOptions, setTTSOptions] = useState<TTSOptions>({
    voice: 'bella_professional', // Changed from bella_premium to bella_professional for more confidence
    pitch: 1.05, // Slightly higher for a younger sound
    rate: 1.0,  // Standard rate for articulate speech
    volume: 0.7,
    enhancedQuality: true
  });
  
  // Load AI settings from localStorage or use defaults
  const loadedAISettings = localStorage.getItem('bella_ai_settings');
  const initialAISettings = loadedAISettings ? JSON.parse(loadedAISettings) : defaultAISettings;
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  
  // Load Google API settings from localStorage
  const [googleAPISettings, setGoogleAPISettings] = useState<GoogleAPISettings>(getGoogleAPISettings());
  
  // Load active provider from localStorage or use default
  const savedProvider = localStorage.getItem('bella_active_provider');
  const [activeProvider, setActiveProvider] = useState<keyof AISettings>(savedProvider as keyof AISettings || 'openRouter');
  
  // Integrations state
  const [integrations, setIntegrations] = useState<Integrations>({
    googleCalendar: { 
      type: 'googleCalendar', 
      name: 'Google Calendar',
      isConnected: false, 
      settings: {}
    },
    googleContacts: { 
      type: 'googleContacts', 
      name: 'Google Contacts',
      isConnected: false, 
      settings: {}
    },
    gmail: { 
      type: 'gmail', 
      name: 'Gmail',
      isConnected: false, 
      settings: {}
    },
    outlookEmail: { 
      type: 'outlookEmail', 
      name: 'Outlook Email',
      isConnected: false, 
      settings: {}
    }
  });
  
  const [userPreferences, setUserPreferences] = useState<UserPreference[]>([]);
  const { toast } = useToast();
  
  // Offline Agents
  const [offlineAgents, setOfflineAgents] = useState<OfflineAgent[]>([
    {
      id: 'business-consultant',
      type: 'business',
      name: 'Business Consultant',
      description: 'Strategic advice for business growth, operations, and management',
      expertise: ['Strategic planning', 'Market analysis', 'Team management', 'Process optimization'],
      icon: 'briefcase',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Business Strategy',
      capabilities: ['Analysis', 'Planning', 'Optimization']
    },
    {
      id: 'fullstack-developer',
      type: 'coding',
      name: 'Full Stack Developer',
      description: 'Expert coding assistance for web, mobile, and backend development',
      expertise: ['React', 'Node.js', 'Python', 'Database design', 'API development', 'DevOps'],
      icon: 'code',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Web Development',
      capabilities: ['Frontend', 'Backend', 'Database']
    },
    {
      id: 'medical-advisor',
      type: 'medical',
      name: 'Medical Advisor',
      description: 'General health information and wellness guidance',
      expertise: ['Health education', 'Wellness tips', 'Medical information', 'Healthy lifestyle'],
      icon: 'stethoscope',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Health & Wellness',
      capabilities: ['Education', 'Guidance', 'Information']
    },
    {
      id: 'finance-advisor',
      type: 'finance',
      name: 'Financial Advisor',
      description: 'Personal finance management and investment guidance',
      expertise: ['Budgeting', 'Investing', 'Retirement planning', 'Debt management'],
      icon: 'dollar-sign',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Personal Finance',
      capabilities: ['Planning', 'Analysis', 'Guidance']
    },
    {
      id: 'social-media-manager',
      type: 'social',
      name: 'Social Media Manager',
      description: 'Strategy and content creation for social media platforms',
      expertise: ['Content strategy', 'Audience growth', 'Engagement tactics', 'Platform optimization'],
      icon: 'share',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Social Media',
      capabilities: ['Strategy', 'Content Creation', 'Analytics']
    }
  ]);
  
  const [activeAgent, setActiveAgent] = useState<AgentType>('general');
  
  // Preload voices when context is first created
  useEffect(() => {
    preloadVoices().catch(err => {
      console.error('Failed to preload voices:', err);
    });
  }, []);
  
  // Save AI settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bella_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);
  
  // Save active provider to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bella_active_provider', activeProvider as string);
  }, [activeProvider]);
  
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
    const intentResult = analyzeIntent(content) as IntentResult;
    
    // Add user message
    const newUserMessage: Message = {
      id: uuidv4(),
      content,
      isUser: true,
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
    
    // Get the model information for response generation
    let responseContent = '';
    
    try {
      if (activeProvider === 'openRouter' && aiSettings.openRouter.apiKey) {
        // In a real app, this would call an edge function to protect the API key
        const selectedModel = aiSettings.openRouter.selectedModel;
        
        console.log(`Using OpenRouter with model: ${selectedModel}`);
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        // Fix the parameter count in getIntentBasedResponse
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          activeProvider, 
          selectedModel
        );
      } else if (activeProvider === 'n8n' && aiSettings.n8n.webhookUrl) {
        // In a real app, this would call the n8n webhook
        const selectedWorkflow = aiSettings.n8n.selectedWorkflow;
        console.log(`Using n8n workflow: ${selectedWorkflow}`);
        
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        // Fix the parameter count in getIntentBasedResponse
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          activeProvider, 
          aiSettings.n8n.selectedWorkflow || ''
        );
      } else {
        // Fallback to default responses
        console.log('Using built-in response generator');
        
        // Simulate variable thinking time based on complexity of the query
        const baseTime = 1000; // Base minimum time
        const wordCount = content.split(/\s+/).length;
        const complexityFactor = Math.min(wordCount / 5, 3); // Cap at 3 seconds additional time
        const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
        
        await new Promise(resolve => setTimeout(resolve, responseTime));
        responseContent = getIntentBasedResponse(intentResult as IntentResult, 'default', 'bella-default');
      }
      
      // Check for integration-specific actions
      if (intentResult.topIntent === 'calendar' && intentResult.entities && Array.isArray(intentResult.entities) && 
          intentResult.entities.find(e => e.entity === 'event_title')) {
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
        isUser: false,
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
  }, [activeProvider, aiSettings, toast, integrations, addUserPreference, activeAgent, offlineAgents]);
  
  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: uuidv4(),
        content: "Hi there! I'm Bella, your premium AI assistant. How can I help you today?",
        isUser: false,
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
  
  const updateAISettings = useCallback((provider: keyof AISettings, settings: Partial<AISettings[keyof AISettings]>) => {
    setAISettings(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider] as any),
        ...settings
      }
    }));
    
    toast({
      title: `${provider === 'openRouter' ? 'OpenRouter' : 'n8n'} settings updated`,
      description: "Your AI provider settings have been updated.",
    });
  }, [toast]);
  
  const updateGoogleAPISettings = useCallback((settings: Partial<GoogleAPISettings>) => {
    const updatedSettings = { ...googleAPISettings, ...settings };
    setGoogleAPISettings(updatedSettings);
    saveGoogleAPISettings(updatedSettings);
    
    toast({
      title: "Google API settings updated",
      description: "Your Google API settings have been saved.",
    });
  }, [googleAPISettings, toast]);
  
  const setActiveProviderWithStorage = useCallback((provider: keyof AISettings) => {
    setActiveProvider(provider);
    localStorage.setItem('bella_active_provider', provider);
  }, []);
  
  return (
    <BellaContext.Provider value={{
      messages,
      isThinking,
      isTalking,
      mood,
      ttsOptions,
      aiSettings,
      googleAPISettings,
      activeProvider,
      integrations,
      userPreferences,
      offlineAgents,
      activeAgent,
      sendMessage,
      clearMessages,
      updateTTSOptions,
      updateAISettings,
      updateGoogleAPISettings,
      setActiveProvider: setActiveProviderWithStorage,
      connectIntegration,
      disconnectIntegration,
      addUserPreference,
      setActiveAgent
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
