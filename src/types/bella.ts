
// Define main type exports
export type Mood = 'neutral' | 'happy' | 'thinking' | 'confused' | 'excited';

export type TTSOptions = {
  voice: string;
  volume: number;
  rate?: number;
  pitch?: number;
  enhancedQuality?: boolean;
};

export type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sender: 'user' | 'bella';
  intentResult?: IntentResult;
  feedbackRating?: number;
  hasBeenReported?: boolean;
};

export type AIModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  costPerToken: number;
  isPremium?: boolean;
  contextLength?: number;
};

export type AIProvider = 'openai' | 'openrouter' | 'anthropic' | 'n8n';

export type AIProviderSettings = {
  apiKey: string;
  selectedModel: string;
  temperature: number;
  maxTokens: number;
};

export type N8nSettings = {
  webhookUrl: string;
  apiKey?: string;
  selectedWorkflow?: string;
};

export type AISettings = {
  openai: AIProviderSettings;
  openRouter: AIProviderSettings;
  anthropic: AIProviderSettings;
  n8n: N8nSettings;
};

export interface GoogleAPISettings {
  apiKey: string;
  clientId: string;
  searchEngineId?: string;
  scopes: string[];
  isConnected?: boolean;
}

export interface OfflineAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  specialization: string;
  capabilities: string[];
  type: AgentType;
  isAvailable?: boolean;
  expertise?: string[];
}

export type IntegrationType = 'supabase' | 'google' | 'zapier' | 'webhooks' | 'googleCalendar' | 'googleContacts' | 'gmail' | 'outlookEmail';

export interface Integration {
  type: IntegrationType;
  name: string;
  isConnected: boolean;
  settings: Record<string, any>;
  lastSynced?: Date;
}

export interface Integrations {
  [key: string]: Integration;
}

export type BellaMood = 'neutral' | 'happy' | 'thinking' | 'confused' | 'excited' | 'surprised' | 'concerned' | 'curious';

export type AgentType = 'researcher' | 'writer' | 'analyst' | 'creative' | 'assistant' | 'general' | 'business' | 'coding' | 'medical' | 'finance' | 'social';

export type UserPreference = {
  key?: string;
  value?: string | number | boolean;
  timestamp?: Date;
  darkMode?: boolean;
  voiceOutput?: boolean;
  autoSuggest?: boolean;
};

export type IntentResult = {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  topIntent?: string;
  text?: string;
  primaryEmotion?: string;
  contextualMemory?: {
    userPreferences?: Record<string, any>;
    recentTopics?: string[];
  };
};

export interface FeedbackData {
  messageId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
  category?: 'helpful' | 'accuracy' | 'safety' | 'other';
}

export interface PrivacySettings {
  saveConversationHistory: boolean;
  useDataForImprovement: boolean;
  dataRetentionPeriod: number; // in days
  allowThirdPartyProcessing: boolean;
}

export interface SafetyGuardrails {
  contentFiltering: boolean;
  sensitiveTopicsBlocked: string[];
  maxPersonalDataRetention: number; // in days
  allowExplicitContent: boolean;
}

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: Mood;
  ttsOptions: TTSOptions;
  aiSettings: AISettings;
  googleAPI: GoogleAPISettings;
  offlineAgents: OfflineAgent[];
  activeProvider: AIProvider;
  integrations: Integrations;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: AIProvider, settings: Partial<AIProviderSettings | N8nSettings>) => void;
  updateGoogleAPISettings: (settings: Partial<GoogleAPISettings>) => void;
  updateOfflineAgent: (agentId: string, settings: Partial<OfflineAgent>) => void;
  setActiveProvider: (provider: AIProvider) => void;
  updateIntegration: (key: string, settings: Partial<Integration>) => void;
  submitFeedback: (feedback: FeedbackData) => void;
  reportMessage: (messageId: string, reason: string) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateSafetyGuardrails: (settings: Partial<SafetyGuardrails>) => void;
  privacySettings: PrivacySettings;
  safetyGuardrails: SafetyGuardrails;
}
