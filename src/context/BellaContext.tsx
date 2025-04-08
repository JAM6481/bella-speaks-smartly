
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { analyzeIntent } from '@/utils/intentService';
import { synthesizeSpeech, cancelSpeech, preloadVoices, getVoiceById } from '@/utils/ttsService';
import { mockConnectIntegration, saveGoogleAPISettings, getGoogleAPISettings } from '@/utils/integrationUtils';
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
  Integrations,
  FeedbackData,
  PrivacySettings,
  SafetyGuardrails,
  TTSOptions
} from '@/types/bella';

// Re-export types properly
export type { IntegrationType } from '@/types/bella';

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: BellaMood;
  ttsOptions: TTSOptions;
  aiSettings: any; // We'll fix this type later in a refactoring
  googleAPISettings: any; // We'll fix this type later in a refactoring
  activeProvider: string;
  integrations: Integrations;
  userPreferences: UserPreference[];
  offlineAgents: OfflineAgent[];
  activeAgent: AgentType;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: string, settings: any) => void;
  updateGoogleAPISettings: (settings: any) => void;
  setActiveProvider: (provider: string) => void;
  connectIntegration: (type: IntegrationType) => Promise<boolean>;
  disconnectIntegration: (type: IntegrationType) => void;
  addUserPreference: (key: string, value: string | number | boolean) => void;
  setActiveAgent: (agentType: AgentType) => void;
  submitFeedback: (feedback: FeedbackData) => void;
  reportMessage: (messageId: string, reason: string) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateSafetyGuardrails: (settings: Partial<SafetyGuardrails>) => void;
  privacySettings: PrivacySettings;
  safetyGuardrails: SafetyGuardrails;
}

const BellaContext = createContext<BellaContextType | undefined>(undefined);

// Default settings for providers
const defaultAISettings = {
  openRouter: {
    apiKey: '',
    selectedModel: 'anthropic/claude-3-sonnet:beta',
    temperature: 0.7,
    maxTokens: 1000
  },
  n8n: {
    webhookUrl: '',
    apiKey: '',
    selectedWorkflow: 'custom-workflow-1'
  }
};

// Default privacy settings
const defaultPrivacySettings: PrivacySettings = {
  saveConversationHistory: true,
  useDataForImprovement: false,
  dataRetentionPeriod: 30,
  allowThirdPartyProcessing: false
};

// Default safety guardrails
const defaultSafetyGuardrails: SafetyGuardrails = {
  contentFiltering: true,
  sensitiveTopicsBlocked: ['illegal activities', 'harmful content'],
  maxPersonalDataRetention: 7,
  allowExplicitContent: false
};

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
    voice: 'en-US-Neural2-F', // Default to Aria voice
    pitch: 1.05, // Slightly higher for a younger sound
    rate: 1.0,  // Standard rate for articulate speech
    volume: 0.7,
    enhancedQuality: true
  });
  
  // Load AI settings from localStorage or use defaults
  const loadedAISettings = localStorage.getItem('bella_ai_settings');
  const initialAISettings = loadedAISettings ? JSON.parse(loadedAISettings) : defaultAISettings;
  const [aiSettings, setAISettings] = useState<any>(initialAISettings);
  
  // Load Google API settings from localStorage
  const [googleAPISettings, setGoogleAPISettings] = useState<any>(getGoogleAPISettings());
  
  // Load active provider from localStorage or use default
  const savedProvider = localStorage.getItem('bella_active_provider');
  const [activeProvider, setActiveProvider] = useState<string>(savedProvider || 'openRouter');
  
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
  
  // Privacy and safety settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [safetyGuardrails, setSafetyGuardrails] = useState<SafetyGuardrails>(defaultSafetyGuardrails);
  
  // Service availability state
  const [onlineServiceAvailable, setOnlineServiceAvailable] = useState(true);
  const [onlineServiceAttempts, setOnlineServiceAttempts] = useState(0);
  
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
  
  // Check online service availability periodically
  useEffect(() => {
    const checkServiceAvailability = async () => {
      // This is a mock implementation - in production, this would ping your actual service
      try {
        const isAvailable = aiSettings.openRouter.apiKey !== '';
        setOnlineServiceAvailable(isAvailable);
        
        if (isAvailable) {
          setOnlineServiceAttempts(0);
        }
      } catch (error) {
        console.error('Error checking service availability:', error);
        setOnlineServiceAvailable(false);
      }
    };
    
    // Run check immediately and then every 30 seconds
    checkServiceAvailability();
    const interval = setInterval(checkServiceAvailability, 30000);
    
    return () => clearInterval(interval);
  }, [aiSettings]);
  
  // Save AI settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bella_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);
  
  // Save active provider to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bella_active_provider', activeProvider);
  }, [activeProvider]);
  
  // Load privacy and safety settings from localStorage
  useEffect(() => {
    const savedPrivacySettings = localStorage.getItem('bella_privacy_settings');
    if (savedPrivacySettings) {
      setPrivacySettings({...defaultPrivacySettings, ...JSON.parse(savedPrivacySettings)});
    }
    
    const savedSafetyGuardrails = localStorage.getItem('bella_safety_guardrails');
    if (savedSafetyGuardrails) {
      setSafetyGuardrails({...defaultSafetyGuardrails, ...JSON.parse(savedSafetyGuardrails)});
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('bella_privacy_settings', JSON.stringify(privacySettings));
  }, [privacySettings]);
  
  useEffect(() => {
    localStorage.setItem('bella_safety_guardrails', JSON.stringify(safetyGuardrails));
  }, [safetyGuardrails]);
  
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
  
  // Handle safety filtering
  const filterMessageForSafety = useCallback((content: string): {safe: boolean, filteredContent: string} => {
    if (!safetyGuardrails.contentFiltering) {
      return { safe: true, filteredContent: content };
    }
    
    let isSafe = true;
    let filteredContent = content;
    
    // Check for blocked topics
    for (const topic of safetyGuardrails.sensitiveTopicsBlocked) {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        isSafe = false;
        filteredContent = `I apologize, but I cannot provide information on that topic as it's been restricted by your safety settings.`;
        break;
      }
    }
    
    // Check for explicit content if not allowed
    if (isSafe && !safetyGuardrails.allowExplicitContent) {
      const explicitTerms = ['nsfw', 'explicit', 'porn', 'xxx', 'adult content'];
      for (const term of explicitTerms) {
        if (content.toLowerCase().includes(term)) {
          isSafe = false;
          filteredContent = `I apologize, but I cannot provide explicit content as it's restricted by your safety settings.`;
          break;
        }
      }
    }
    
    return { safe: isSafe, filteredContent };
  }, [safetyGuardrails]);
  
  // Submit feedback
  const submitFeedback = useCallback((feedback: FeedbackData) => {
    // In a production app, this would be sent to a server
    console.log('Feedback submitted:', feedback);
    
    // Update the message to include feedback
    setMessages(prev => 
      prev.map(message => 
        message.id === feedback.messageId 
          ? { ...message, feedbackRating: feedback.rating } 
          : message
      )
    );
    
    toast({
      title: "Feedback submitted",
      description: "Thank you for helping improve Bella!",
    });
  }, [toast]);
  
  // Report message
  const reportMessage = useCallback((messageId: string, reason: string) => {
    // In a production app, this would be sent to a server
    console.log('Message reported:', messageId, reason);
    
    // Update the message to mark it as reported
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, hasBeenReported: true } 
          : message
      )
    );
    
    toast({
      title: "Message reported",
      description: "Thank you for helping keep Bella safe and accurate.",
    });
  }, [toast]);
  
  // Update privacy settings
  const updatePrivacySettings = useCallback((settings: Partial<PrivacySettings>) => {
    setPrivacySettings(prev => ({
      ...prev,
      ...settings
    }));
    
    toast({
      title: "Privacy settings updated",
      description: "Your privacy preferences have been saved.",
    });
  }, [toast]);
  
  // Update safety guardrails
  const updateSafetyGuardrails = useCallback((settings: Partial<SafetyGuardrails>) => {
    setSafetyGuardrails(prev => ({
      ...prev,
      ...settings
    }));
    
    toast({
      title: "Safety settings updated",
      description: "Your safety preferences have been saved.",
    });
  }, [toast]);
  
  const shouldUseOfflineMode = useCallback(() => {
    // Logic to determine if we should use offline mode:
    // 1. If online service isn't available at all
    // 2. If we've tried multiple times and had issues
    return !onlineServiceAvailable || onlineServiceAttempts > 3;
  }, [onlineServiceAvailable, onlineServiceAttempts]);
  
  const sendMessage = useCallback(async (content: string) => {
    // Process the message with intent recognition
    const safetyCheck = filterMessageForSafety(content);
    if (!safetyCheck.safe) {
      // Add user message
      const newUserMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
      // Add safety response
      const safetyResponse: Message = {
        id: uuidv4(),
        content: safetyCheck.filteredContent,
        isUser: false,
        sender: 'bella',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, safetyResponse]);
      return;
    }
    
    // Content is safe, proceed with normal processing
    const intentResult = analyzeIntent(content);
    
    // Add user message
    const newUserMessage: Message = {
      id: uuidv4(),
      content,
      isUser: true,
      sender: 'user',
      timestamp: new Date(),
      intentResult: intentResult as IntentResult
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsThinking(true);
    
    // Determine mood based on intent analysis
    const newMood = determineMood(intentResult as IntentResult);
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
    
    // Determine if we should use online or offline mode
    const useOfflineMode = shouldUseOfflineMode();
    const currentProvider = useOfflineMode ? 'offline' : activeProvider;
    
    // Get the model information for response generation
    let responseContent = '';
    
    try {
      if (currentProvider === 'openRouter' && aiSettings.openRouter.apiKey) {
        // In a real app, this would call an edge function to protect the API key
        const selectedModel = aiSettings.openRouter.selectedModel;
        
        console.log(`Using OpenRouter with model: ${selectedModel}`);
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          'openRouter', 
          selectedModel
        );
        
        // Reset attempt counter on success
        setOnlineServiceAttempts(0);
      } else if (currentProvider === 'n8n' && aiSettings.n8n.webhookUrl) {
        // In a real app, this would call the n8n webhook
        const selectedWorkflow = aiSettings.n8n.selectedWorkflow;
        console.log(`Using n8n workflow: ${selectedWorkflow}`);
        
        // Simulate response generation
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          'n8n', 
          aiSettings.n8n.selectedWorkflow || ''
        );
        
        // Reset attempt counter on success
        setOnlineServiceAttempts(0);
      } else {
        // Use offline mode
        console.log('Using offline mode with built-in response generator');
        
        if (!useOfflineMode) {
          setOnlineServiceAttempts(prev => prev + 1);
        }
        
        // Simulate variable thinking time based on complexity of the query
        const baseTime = 1000;
        const wordCount = content.split(/\s+/).length;
        const complexityFactor = Math.min(wordCount / 5, 3);
        const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
        
        await new Promise(resolve => setTimeout(resolve, responseTime));
        responseContent = getIntentBasedResponse(intentResult as IntentResult, 'offline', 'bella-default');
        
        // Add notice about offline mode if we should be online
        if (!useOfflineMode) {
          responseContent += "\n\n*Note: I'm currently using offline mode because there seems to be an issue with the online service. This may limit some of my capabilities. Please check your connection or try again later.*";
        }
      }
      
      // Check for integration-specific actions
      if (intentResult.topIntent === 'calendar' && intentResult.entities && 
          intentResult.entities['event_title']) {
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
      
      // Increment attempt counter on error
      setOnlineServiceAttempts(prev => prev + 1);
      
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
  }, [
    activeProvider, 
    aiSettings, 
    toast, 
    integrations, 
    addUserPreference, 
    activeAgent, 
    offlineAgents, 
    onlineServiceAvailable, 
    onlineServiceAttempts, 
    shouldUseOfflineMode, 
    filterMessageForSafety
  ]);
  
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
  
  const updateAISettings = useCallback((provider: string, settings: any) => {
    setAISettings(prev => ({
      ...prev,
      [provider]: {
        ...(prev[provider]),
        ...settings
      }
    }));
    
    toast({
      title: `${provider === 'openRouter' ? 'OpenRouter' : 'n8n'} settings updated`,
      description: "Your AI provider settings have been updated.",
    });
  }, [toast]);
  
  const updateGoogleAPISettings = useCallback((settings: any) => {
    const updatedSettings = { ...googleAPISettings, ...settings };
    setGoogleAPISettings(updatedSettings);
    saveGoogleAPISettings(updatedSettings);
    
    toast({
      title: "Google API settings updated",
      description: "Your Google API settings have been saved.",
    });
  }, [googleAPISettings, toast]);
  
  const setActiveProviderWithStorage = useCallback((provider: string) => {
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
      setActiveAgent,
      submitFeedback,
      reportMessage,
      updatePrivacySettings,
      updateSafetyGuardrails,
      privacySettings,
      safetyGuardrails
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
