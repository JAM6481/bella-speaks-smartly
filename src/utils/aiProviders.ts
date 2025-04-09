
export type AIProvider = 'openrouter' | 'n8n' | 'openai' | 'anthropic';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  contextLength?: number;
  isAvailable: boolean;
  isPremium?: boolean;
}

// OpenAI models
export const openAIModels: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI\'s most capable model with exceptional intelligence and multimodal reasoning',
    contextLength: 128000,
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Smaller, faster, and more cost-effective version of GPT-4o',
    contextLength: 128000,
    isAvailable: true
  }
];

// OpenRouter models
export const openRouterModels: AIModel[] = [
  {
    id: 'anthropic/claude-3-opus:beta',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    description: 'Anthropic\'s most powerful model with exceptional intelligence and capabilities',
    contextLength: 200000,
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'anthropic/claude-3-sonnet:beta',
    name: 'Claude 3 Sonnet',
    provider: 'openrouter',
    description: 'Balanced intelligence and speed for a wide range of tasks',
    contextLength: 180000,
    isAvailable: true
  },
  {
    id: 'anthropic/claude-3-haiku:beta',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    description: 'Fast and cost-effective for straightforward tasks',
    contextLength: 150000,
    isAvailable: true
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'openrouter',
    description: 'Google\'s most capable model for text and reasoning tasks',
    contextLength: 32000,
    isAvailable: true
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'openrouter',
    description: 'Meta\'s most capable open-source model',
    contextLength: 8000,
    isAvailable: true
  }
];

// Anthropic models (direct API)
export const anthropicModels: AIModel[] = [
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Anthropic\'s most capable model for complex reasoning and tasks',
    contextLength: 200000,
    isAvailable: true,
    isPremium: true
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balance of intelligence and speed',
    contextLength: 180000,
    isAvailable: true
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast, efficient, and cost-effective',
    contextLength: 150000,
    isAvailable: true
  }
];

// n8n models (these would typically be fetched from n8n API)
export const n8nModels: AIModel[] = [
  {
    id: 'custom-workflow-1',
    name: 'Smart Customer Service',
    provider: 'n8n',
    description: 'Customer service workflow with entity recognition and sentiment analysis',
    isAvailable: true
  },
  {
    id: 'custom-workflow-2',
    name: 'Data Analysis Pipeline',
    provider: 'n8n',
    description: 'Advanced data processing with multi-step validation and enrichment',
    isAvailable: true
  },
  {
    id: 'custom-workflow-3',
    name: 'Multi-Platform Integration',
    provider: 'n8n',
    description: 'Connect with multiple third-party services and APIs',
    isAvailable: true
  }
];

export const getAllModels = (): AIModel[] => {
  return [...openAIModels, ...openRouterModels, ...anthropicModels, ...n8nModels];
};

export const getModelById = (id: string): AIModel | undefined => {
  return getAllModels().find(model => model.id === id);
};

export const getModelsByProvider = (provider: AIProvider): AIModel[] => {
  return getAllModels().filter(model => model.provider === provider);
};

export interface AIProviderSettings {
  openai: {
    apiKey: string;
    selectedModel: string;
    temperature: number;
    maxTokens: number;
  };
  openRouter: {
    apiKey: string;
    selectedModel: string;
    temperature: number;
    maxTokens: number;
  };
  anthropic: {
    apiKey: string;
    selectedModel: string;
    temperature: number;
    maxTokens: number;
  };
  n8n: {
    webhookUrl: string;
    apiKey: string;
    selectedWorkflow: string;
  };
}

export const defaultAISettings: AIProviderSettings = {
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

// Function to determine the best provider based on available API keys
export const getBestAvailableProvider = (settings: AIProviderSettings): AIProvider => {
  // Prioritize OpenAI as it's the newest and most reliable
  if (settings.openai.apiKey) {
    return 'openai';
  }
  
  // Then Anthropic direct
  if (settings.anthropic.apiKey) {
    return 'anthropic';
  }
  
  // Then OpenRouter
  if (settings.openRouter.apiKey) {
    return 'openrouter';
  }
  
  // Fallback to n8n if available
  if (settings.n8n.webhookUrl && settings.n8n.apiKey) {
    return 'n8n';
  }
  
  // If no API keys are set, default to OpenAI as the primary UI choice
  return 'openai';
};
