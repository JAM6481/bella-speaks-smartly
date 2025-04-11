import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { analyzeIntent } from '@/utils/intentService';
import { synthesizeSpeech, cancelSpeech, preloadVoices, getVoiceById } from '@/utils/ttsService';
import { mockConnectIntegration, saveGoogleAPISettings, getGoogleAPISettings } from '@/utils/integrationUtils';
import { getIntentBasedResponse } from '@/utils/responseGenerator';
import { determineMood } from '@/utils/moodUtils';
import { checkActualConnectivity, detectNetworkConditions } from '@/utils/responseOptimizer';
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
  TTSOptions,
  AISettings,
  AIProvider,
  ConnectionStatus,
  AIProviderSettings,
  N8nSettings
} from '@/types/bella';

export type { IntegrationType } from '@/types/bella';

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: BellaMood;
  ttsOptions: TTSOptions;
  aiSettings: AISettings;
  googleAPISettings: any;
  activeProvider: AIProvider;
  integrations: Integrations;
  userPreferences: UserPreference[];
  offlineAgents: OfflineAgent[];
  activeAgent: AgentType;
  connectionStatus: ConnectionStatus;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: AIProvider, settings: Partial<AIProviderSettings | N8nSettings>) => void;
  updateGoogleAPISettings: (settings: any) => void;
  setActiveProvider: (provider: AIProvider) => void;
  connectIntegration: (type: IntegrationType) => Promise<boolean>;
  disconnectIntegration: (type: IntegrationType) => void;
  addUserPreference: (key: string, value: string | number | boolean) => void;
  setActiveAgent: (agentType: AgentType) => void;
  submitFeedback: (feedback: FeedbackData) => void;
  reportMessage: (messageId: string, reason: string) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateSafetyGuardrails: (settings: Partial<SafetyGuardrails>) => void;
  activateAgent: (agentType: AgentType, query?: string) => Promise<void>;
  checkConnectionStatus: () => Promise<ConnectionStatus>;
  privacySettings: PrivacySettings;
  safetyGuardrails: SafetyGuardrails;
}

const BellaContext = createContext<BellaContextType | undefined>(undefined);

const defaultAISettings: AISettings = {
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

const defaultConnectionStatus: ConnectionStatus = {
  isOnline: true,
  lastChecked: new Date(),
  latency: 0,
  connectionType: 'unknown',
  retry: 0
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
  
  const initialAISettings: AISettings = {
    openai: { ...defaultAISettings.openai, ...(parsedSettings.openai || {}) },
    openRouter: { ...defaultAISettings.openRouter, ...(parsedSettings.openRouter || {}) },
    anthropic: { ...defaultAISettings.anthropic, ...(parsedSettings.anthropic || {}) },
    n8n: { ...defaultAISettings.n8n, ...(parsedSettings.n8n || {}) }
  };
  
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);
  
  const [googleAPISettings, setGoogleAPISettings] = useState<any>(getGoogleAPISettings());
  
  const savedProvider = localStorage.getItem('bella_active_provider');
  const [activeProvider, setActiveProvider] = useState<AIProvider>(savedProvider as AIProvider || 'openRouter');
  
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
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(defaultConnectionStatus);
  
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
      capabilities: ['Analysis', 'Planning', 'Optimization'],
      promptTemplate: 'You are an expert business consultant specializing in {specialization}. The user needs help with: {query}'
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
      capabilities: ['Frontend', 'Backend', 'Database'],
      promptTemplate: 'You are an expert developer specializing in {specialization}. Provide detailed, accurate code and explanations. The user needs help with: {query}'
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
      capabilities: ['Education', 'Guidance', 'Information'],
      promptTemplate: 'You are a medical information provider specializing in {specialization}. Provide accurate information but clearly state you are not a doctor and not providing medical advice. The user asks: {query}'
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
      capabilities: ['Planning', 'Analysis', 'Guidance'],
      promptTemplate: 'You are a financial information specialist in {specialization}. Provide educational information about finance but clearly state you are not providing personalized financial advice. The user asks: {query}'
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
      capabilities: ['Strategy', 'Content Creation', 'Analytics'],
      promptTemplate: 'You are a social media expert specializing in {specialization}. The user needs help with: {query}'
    },
    {
      id: 'productivity-coach',
      type: 'productivity',
      name: 'Productivity Coach',
      description: 'Time management, goal setting, and productivity systems',
      expertise: ['Time management', 'Goal setting', 'Habit formation', 'Personal organization'],
      icon: 'clock',
      isAvailable: true,
      isEnabled: true,
      specialization: 'Personal Productivity',
      capabilities: ['Planning', 'Systems', 'Organization'],
      promptTemplate: 'You are a productivity expert specializing in {specialization}. The user needs help with: {query}'
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
      const networkStatus = await detectNetworkConditions();
      const realConnectivity = await checkActualConnectivity();
      
      setConnectionStatus({
        isOnline: realConnectivity && !networkStatus.isOfflineMode,
        lastChecked: new Date(),
        latency: networkStatus.latency,
        connectionType: networkStatus.connectionType || 'unknown',
        retry: connectionStatus.retry
      });
    };
    
    checkServiceAvailability();
    const interval = setInterval(checkServiceAvailability, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
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
  
  const checkConnectionStatus = useCallback(async (): Promise<ConnectionStatus> => {
    try {
      const networkStatus = await detectNetworkConditions();
      const realConnectivity = await checkActualConnectivity();
      
      const newStatus = {
        isOnline: realConnectivity && !networkStatus.isOfflineMode,
        lastChecked: new Date(),
        latency: networkStatus.latency,
        connectionType: networkStatus.connectionType || 'unknown',
        retry: connectionStatus.retry
      };
      
      setConnectionStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Error checking connection status:', error);
      
      const fallbackStatus = {
        isOnline: navigator.onLine,
        lastChecked: new Date(),
        latency: 1000,
        connectionType: 'unknown',
        retry: connectionStatus.retry + 1
      };
      
      setConnectionStatus(fallbackStatus);
      return fallbackStatus;
    }
  }, [connectionStatus.retry]);
  
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
    return !connectionStatus.isOnline || connectionStatus.retry > 3;
  }, [connectionStatus]);
  
  const activateAgent = useCallback(async (agentType: AgentType, query?: string) => {
    const agent = offlineAgents.find(agent => agent.type === agentType);
    
    if (!agent) {
      toast({
        title: "Agent not available",
        description: `The ${agentType} agent is not available.`,
        variant: "destructive"
      });
      return;
    }
    
    setActiveAgent(agentType);
    
    if (query) {
      await sendMessage(query);
    } else {
      const agentIntroMessage: Message = {
        id: uuidv4(),
        content: `I'm now using the ${agent.name} to assist you. This agent specializes in ${agent.specialization}. How can I help you with ${agent.capabilities.join(', ')}?`,
        isUser: false,
        sender: 'agent',
        agentType: agentType,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentIntroMessage]);
    }
    
    toast({
      title: `${agent.name} activated`,
      description: `You're now talking to the ${agent.name}.`,
    });
  }, [offlineAgents, toast]);
  
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
    
    await checkConnectionStatus();
    const useOfflineMode = shouldUseOfflineMode();
    
    const currentProvider = useOfflineMode ? 'offline' : activeProvider;
    
    let responseContent = '';
    let responseSender: 'bella' | 'agent' = 'bella';
    let responseAgentType: AgentType | undefined = undefined;
    
    try {
      if (useSpecializedAgent) {
        const agent = offlineAgents.find(a => a.type === requiredAgentType);
        
        if (agent) {
          responseAgentType = agent.type;
          responseSender = 'agent';
          
          const agentPrompt = agent.promptTemplate
            ?.replace('{specialization}', agent.specialization)
            .replace('{query}', content) || '';
          
          if (!useOfflineMode && aiSettings[activeProvider] && 
              (activeProvider === 'openRouter' ? aiSettings.openRouter.apiKey : true)) {
            
            console.log(`Using ${activeProvider} for ${agent.name} agent response`);
            
            const responseTime = 1000 + (content.length * 15) + Math.random() * 2000;
            await new Promise(resolve => setTimeout(resolve, responseTime));
            
            switch (agent.type) {
              case 'business':
                responseContent = `As a Business Consultant specialized in ${agent.specialization}, I can help with your question about ${content.substring(0, 30)}... 
                
                Based on my analysis, here are some key points to consider:
                
                1. Market positioning is essential for ${content.includes('startup') ? 'your startup' : 'your business'}
                2. Consider your competitive advantage in terms of ${content.includes('price') ? 'pricing strategy' : 'unique value proposition'}
                3. Developing a clear ${content.includes('plan') ? 'business plan' : 'strategy'} will help guide your decisions
                
                Would you like me to elaborate on any specific aspect of this advice?`;
                break;
              
              case 'coding':
                responseContent = `As a Full Stack Developer with expertise in ${agent.specialization}, I can assist with your coding question.
                
                ${content.includes('React') ? 'For React applications, consider these best practices:' : 'Here are some development best practices to consider:'}
                
                1. ${content.includes('performance') ? 'Optimize rendering with useMemo and useCallback hooks' : 'Structure your components for maximum reusability'}
                2. ${content.includes('API') ? 'Implement proper error handling for API requests' : 'Use TypeScript for better type safety and developer experience'}
                3. ${content.includes('state') ? 'Consider using a state management solution like Redux or Context API' : 'Write unit tests for critical functionality'}
                
                Would you like me to provide some code examples or explain any concept in more detail?`;
                break;
              
              case 'medical':
                responseContent = `As a Medical Information Provider focused on ${agent.specialization}, I can share some general health information. Note that I'm not a doctor and this isn't medical advice.
                
                ${content.includes('diet') ? 'Regarding nutrition and diet:' : 'Regarding general wellness:'}
                
                1. ${content.includes('sleep') ? 'Quality sleep is crucial for overall health and immune function' : 'Regular physical activity offers numerous health benefits'}
                2. ${content.includes('stress') ? 'Stress management techniques like meditation can be beneficial' : 'Staying hydrated is important for many bodily functions'}
                3. ${content.includes('vitamin') ? 'A balanced diet rich in nutrients is preferable to supplements in most cases' : 'Preventive health screenings are important based on age and risk factors'}
                
                For personalized health advice, please consult with a qualified healthcare professional.`;
                break;
                
              case 'finance':
                responseContent = `As a Financial Information Specialist in ${agent.specialization}, I can provide some general guidance. Note that this is educational information, not personalized financial advice.
                
                ${content.includes('invest') ? 'Regarding investments:' : 'Regarding personal finance:'}
                
                1. ${content.includes('budget') ? 'Creating a detailed budget is the foundation of financial health' : 'Emergency funds typically cover 3-6 months of essential expenses'}
                2. ${content.includes('debt') ? 'Prioritizing high-interest debt typically saves more money long-term' : 'Diversification is a key principle in investment risk management'}
                3. ${content.includes('retire') ? 'Retirement planning benefits from starting early due to compound growth' : 'Tax-advantaged accounts often provide benefits for long-term financial goals'}
                
                For personalized financial advice, consider consulting with a certified financial planner.`;
                break;
                
              default:
                responseContent = `As a specialized agent in ${agent.specialization}, I can help you with your question about ${content.substring(0, 30)}...
                
                Here are some key insights related to your query:
                
                1. ${agent.expertise && agent.expertise[0] ? agent.expertise[0] + ' is an important consideration' : 'Consider the specific goals you want to achieve'}
                2. ${agent.expertise && agent.expertise[1] ? 'Applying ' + agent.expertise[1] + ' techniques could be beneficial' : 'Analyze the current situation thoroughly'}
                3. ${agent.expertise && agent.expertise[2] ? agent.expertise[2] + ' strategies can be effective here' : 'Develop a plan with measurable outcomes'}
                
                Would you like me to elaborate on any of these points or provide more specific information?`;
            }
            
            setConnectionStatus(prev => ({
              ...prev,
              retry: 0
            }));
          } else {
            console.log('Using offline mode for agent response');
            
            const baseTime = 800;
            const wordCount = content.split(/\s+/).length;
            const complexityFactor = Math.min(wordCount / 5, 3);
            const responseTime = baseTime + (complexityFactor * 300) + (Math.random() * 500);
            
            await new Promise(resolve => setTimeout(resolve, responseTime));
            
            responseContent = `As your ${agent.name} specialized in ${agent.specialization}, I'll do my best to help with your question about ${content.substring(0, 30)}...
            
            Here are some insights based on my expertise in ${agent.capabilities.join(', ')}:
            
            1. ${agent.expertise && agent.expertise[0] ? agent.expertise[0] + ' is a key consideration here' : 'First, consider your specific goals and constraints'}
            2. ${agent.expertise && agent.expertise[1] ? 'Applying ' + agent.expertise[1] + ' principles could help' : 'Analyze the current situation methodically'}
            3. ${agent.expertise && agent.expertise[2] ? agent.expertise[2] + ' strategies often work well' : 'Develop a structured approach with clear milestones'}
            
            ${!useOfflineMode ? "Note: I'm currently working in offline mode. When you connect to an online AI model, I can provide more detailed and personalized responses." : "Would you like me to elaborate on any of these points?"}`;
          }
        } else {
          responseContent = `I noticed you might need help with ${requiredAgentType}, but I don't have a specialized agent for that yet. I'll do my best to assist with your question about ${content.substring(0, 30)}...`;
          responseSender = 'bella';
        }
      } else {
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
          
          setConnectionStatus(prev => ({
            ...prev,
            retry: 0
          }));
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
          
          setConnectionStatus(prev => ({
            ...prev,
            retry: 0
          }));
        } else {
          console.log('Using offline mode with built-in response generator');
          
          if (!useOfflineMode) {
            setConnectionStatus(prev => ({
              ...prev,
              retry: prev.retry + 1
            }));
          }
          
          const baseTime = 1000;
          const wordCount = content.split(/\s+/).length;
          const complexityFactor = Math.min(wordCount / 5, 3);
          const responseTime = baseTime + (complexityFactor * 500) + (Math.random() * 1000);
          
          await new Promise(resolve => setTimeout(resolve, responseTime));
          responseContent = getIntentBasedResponse(intentResult as IntentResult, 'offline', 'bella-default');
          
          if (!useOfflineMode) {
            responseContent += "\n\n*Note: I'm currently using offline mode because there seems to be an issue with the online service. This may limit some of my capabilities. Please check your connection or API settings and try again later.*";
          }
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
      
      setConnectionStatus(prev => ({
        ...prev,
        retry: prev.retry + 1
      }));
      
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
        sender: responseSender,
        agentType: responseAgentType,
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
    shouldUseOfflineMode, 
    filterMessageForSafety, 
    connectionStatus,
    checkConnectionStatus
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
  
  const updateAISettings = useCallback((provider: AIProvider, settings: Partial<AIProviderSettings | N8nSettings>) => {
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
  
  const setActiveProviderWithStorage = useCallback((provider: AIProvider) => {
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
      connectionStatus,
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
      activateAgent,
      checkConnectionStatus,
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
