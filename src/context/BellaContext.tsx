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

export type { IntegrationType } from '@/types/bella';

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: BellaMood;
  ttsOptions: TTSOptions;
  aiSettings: any;
  googleAPISettings: any;
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

const defaultAISettings = {
  openai: {
    apiKey: '',
    selectedModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000
  },
  openRouter: {
    apiKey: '',
    selectedModel: 'anthropic/claude-3-sonnet:beta',
    temperature: 0.7,
    maxTokens: 1000
  },
  anthropic: {
    apiKey: '',
    selectedModel: 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 1000
  },
  n8n: {
    webhookUrl: '',
    apiKey: '',
    selectedWorkflow: 'custom-workflow-1'
  }
};

const defaultPrivacySettings: PrivacySettings = {
  saveConversationHistory: true,
  useDataForImprovement: false,
  dataRetentionPeriod: 30,
  allowThirdPartyProcessing: false
};

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
  
  const [ttsOptions, setTTSOptions] = useState<TTSOptions>({
    voice: 'en-US-Neural2-F',
    pitch: 1.05,
    rate: 1.0,
    volume: 0.7,
    enhancedQuality: true
  });
  
  const loadedAISettings = localStorage.getItem('bella_ai_settings');
  const parsedSettings = loadedAISettings ? JSON.parse(loadedAISettings) : {};
  
  const initialAISettings = {
    openai: { ...defaultAISettings.openai, ...(parsedSettings.openai || {}) },
    openRouter: { ...defaultAISettings.openRouter, ...(parsedSettings.openRouter || {}) },
    anthropic: { ...defaultAISettings.anthropic, ...(parsedSettings.anthropic || {}) },
    n8n: { ...defaultAISettings.n8n, ...(parsedSettings.n8n || {}) }
  };
  
  const [aiSettings, setAISettings] = useState<any>(initialAISettings);
  
  const [googleAPISettings, setGoogleAPISettings] = useState<any>(getGoogleAPISettings());
  
  const savedProvider = localStorage.getItem('bella_active_provider');
  const [activeProvider, setActiveProvider] = useState<string>(savedProvider || 'openRouter');
  
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
  
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(defaultPrivacySettings);
  const [safetyGuardrails, setSafetyGuardrails] = useState<SafetyGuardrails>(defaultSafetyGuardrails);
  
  const [onlineServiceAvailable, setOnlineServiceAvailable] = useState(true);
  const [onlineServiceAttempts, setOnlineServiceAttempts] = useState(0);
  
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
  
  useEffect(() => {
    preloadVoices().catch(err => {
      console.error('Failed to preload voices:', err);
    });
  }, []);
  
  useEffect(() => {
    const checkServiceAvailability = async () => {
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
    
    checkServiceAvailability();
    const interval = setInterval(checkServiceAvailability, 30000);
    
    return () => clearInterval(interval);
  }, [aiSettings]);
  
  useEffect(() => {
    localStorage.setItem('bella_ai_settings', JSON.stringify(aiSettings));
  }, [aiSettings]);
  
  useEffect(() => {
    localStorage.setItem('bella_active_provider', activeProvider);
  }, [activeProvider]);
  
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
      const existingIndex = prev.findIndex(p => p.key === key);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          value,
          timestamp: new Date()
        };
        return updated;
      } else {
        return [...prev, {
          key,
          value,
          timestamp: new Date()
        }];
      }
    });
  }, []);
  
  const filterMessageForSafety = useCallback((content: string): {safe: boolean, filteredContent: string} => {
    if (!safetyGuardrails.contentFiltering) {
      return { safe: true, filteredContent: content };
    }
    
    let isSafe = true;
    let filteredContent = content;
    
    for (const topic of safetyGuardrails.sensitiveTopicsBlocked) {
      if (content.toLowerCase().includes(topic.toLowerCase())) {
        isSafe = false;
        filteredContent = `I apologize, but I cannot provide information on that topic as it's been restricted by your safety settings.`;
        break;
      }
    }
    
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
  
  const submitFeedback = useCallback((feedback: FeedbackData) => {
    console.log('Feedback submitted:', feedback);
    
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
  
  const reportMessage = useCallback((messageId: string, reason: string) => {
    console.log('Message reported:', messageId, reason);
    
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
    return !onlineServiceAvailable || onlineServiceAttempts > 3;
  }, [onlineServiceAvailable, onlineServiceAttempts]);
  
  const sendMessage = useCallback(async (content: string) => {
    const safetyCheck = filterMessageForSafety(content);
    if (!safetyCheck.safe) {
      const newUserMessage: Message = {
        id: uuidv4(),
        content,
        isUser: true,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newUserMessage]);
      
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
    
    const intentResult = analyzeIntent(content);
    
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
    
    const newMood = determineMood(intentResult as IntentResult);
    setMood(newMood);
    
    if (intentResult.contextualMemory?.userPreferences) {
      const preferences = intentResult.contextualMemory.userPreferences;
      
      Object.entries(preferences).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          addUserPreference(key, value);
        }
      });
    }
    
    const useOfflineMode = shouldUseOfflineMode();
    const currentProvider = useOfflineMode ? 'offline' : activeProvider;
    
    let responseContent = '';
    
    try {
      if (currentProvider === 'openRouter' && aiSettings.openRouter.apiKey) {
        const selectedModel = aiSettings.openRouter.selectedModel;
        
        console.log(`Using OpenRouter with model: ${selectedModel}`);
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          'openRouter', 
          selectedModel
        );
        
        setOnlineServiceAttempts(0);
      } else if (currentProvider === 'n8n' && aiSettings.n8n.webhookUrl) {
        const selectedWorkflow = aiSettings.n8n.selectedWorkflow;
        console.log(`Using n8n workflow: ${selectedWorkflow}`);
        
        const responseTime = 1000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, responseTime));
        
        responseContent = getIntentBasedResponse(
          intentResult as IntentResult, 
          'n8n', 
          aiSettings.n8n.selectedWorkflow || ''
        );
        
        setOnlineServiceAttempts(0);
      } else {
        console.log('Using offline mode with built-in response generator');
        
        if (!useOfflineMode) {
          setOnlineServiceAttempts(prev => prev + 1);
        }
        
        const baseTime = 1000;
        const wordCount = content.split(/\s+/).length;
        const complexityFactor = Math.min(wordCount / 5, 3);
        const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
        
        await new Promise(resolve => setTimeout(resolve, responseTime));
        responseContent = getIntentBasedResponse(intentResult as IntentResult, 'offline', 'bella-default');
        
        if (!useOfflineMode) {
          responseContent += "\n\n*Note: I'm currently using offline mode because there seems to be an issue with the online service. This may limit some of my capabilities. Please check your connection or try again later.*";
        }
      }
      
      if (intentResult.topIntent === 'calendar' && intentResult.entities && 
          intentResult.entities['event_title']) {
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
      
      setOnlineServiceAttempts(prev => prev + 1);
      
      toast({
        title: "Error",
        description: "Failed to generate response. Please check your settings and try again.",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
      setIsTalking(true);
      
      const newBellaMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        isUser: false,
        sender: 'bella',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newBellaMessage]);
      
      const responseWords = responseContent.split(/\s+/).length;
      const wordsPerSecond = 2.5;
      const punctuationCount = (responseContent.match(/[.,;:!?]/g) || []).length;
      const pauseTime = punctuationCount * 0.2;
      
      const speakingTime = (responseWords / wordsPerSecond) * 1000 + pauseTime * 1000;
      
      setTimeout(() => {
        setIsTalking(false);
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
