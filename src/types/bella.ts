
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
};

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  costPerToken: number;
}

export interface AIProvider {
  name: string;
  apiKey: string;
  endpoint?: string;
  models: AIModel[];
  selectedModel: string;
}

export interface N8nSettings {
  webhookUrl: string;
  apiKey?: string;
  selectedWorkflow?: string;
}

export interface AISettings {
  openAI: AIProvider;
  openRouter: AIProvider;
  anthropic: AIProvider;
  n8n: N8nSettings;
}

export interface GoogleAPISettings {
  apiKey: string;
  searchEngineId: string;
  isConnected: boolean;
}

export interface OfflineAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  specialization: string;
  capabilities: string[];
  type: string;
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

export interface BellaContextType {
  messages: Message[];
  isThinking: boolean;
  isTalking: boolean;
  mood: Mood;
  ttsOptions: TTSOptions;
  aiSettings: AISettings;
  googleAPI: GoogleAPISettings;
  offlineAgents: OfflineAgent[];
  activeProvider: 'openai' | 'openrouter' | 'anthropic' | 'n8n';
  integrations: Integrations;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  updateTTSOptions: (options: Partial<TTSOptions>) => void;
  updateAISettings: (provider: string, settings: Partial<AIProvider | N8nSettings>) => void;
  updateGoogleAPISettings: (settings: Partial<GoogleAPISettings>) => void;
  updateOfflineAgent: (agentId: string, settings: Partial<OfflineAgent>) => void;
  setActiveProvider: (provider: 'openai' | 'openrouter' | 'anthropic' | 'n8n') => void;
  updateIntegration: (key: string, settings: Partial<Integration>) => void;
}
