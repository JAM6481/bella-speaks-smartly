
import { IntegrationType, GoogleAPISettings } from '@/types/bella';

// Mock functions for integration (in a real app, these would connect to actual services)
export const mockConnectIntegration = async (type: IntegrationType): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

// Improved connection testing function
export const testServiceConnection = async (serviceUrl: string, apiKey?: string): Promise<boolean> => {
  // Simulate a connection test with timeout and retry logic
  try {
    const maxRetries = 3;
    let retryCount = 0;
    let connected = false;
    
    while (!connected && retryCount < maxRetries) {
      try {
        // In a real implementation, this would test the actual service connection
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // If we have an API key, consider it a success
        if (apiKey && apiKey.trim() !== '') {
          return true;
        }
        
        // For services without API keys, we'd check the URL
        if (serviceUrl && serviceUrl.trim() !== '') {
          return true;
        }
        
        return false;
      } catch (err) {
        retryCount++;
        console.warn(`Connection attempt ${retryCount} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error testing service connection:', error);
    return false;
  }
};

// Google API integration details
export interface GoogleAPISettings {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export const googleAPIDefaults: GoogleAPISettings = {
  clientId: '',
  apiKey: '',
  scopes: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/gmail.readonly'
  ]
};

// Function to store Google API settings to localStorage
export const saveGoogleAPISettings = (settings: GoogleAPISettings): void => {
  localStorage.setItem('bella_google_api_settings', JSON.stringify(settings));
};

// Function to retrieve Google API settings from localStorage
export const getGoogleAPISettings = (): GoogleAPISettings => {
  const saved = localStorage.getItem('bella_google_api_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing Google API settings:', e);
    }
  }
  return googleAPIDefaults;
};

// Improved API key handling functions
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) return '••••••••';
  return apiKey.substring(0, 4) + '••••••••' + apiKey.substring(apiKey.length - 4);
};

export const isValidApiKey = (apiKey: string, provider: string): boolean => {
  if (!apiKey || apiKey.trim() === '') return false;
  
  // Basic validation patterns for different API key formats
  const patterns: Record<string, RegExp> = {
    openRouter: /^sk-or-[a-zA-Z0-9]{24,}/,
    openai: /^sk-[a-zA-Z0-9]{24,}/,
    anthropic: /^sk-ant-[a-zA-Z0-9]{24,}/,
    elevenlabs: /^[a-zA-Z0-9]{32,}/,
    google: /^AIza[0-9A-Za-z-_]{35}/
  };
  
  if (patterns[provider]) {
    return patterns[provider].test(apiKey);
  }
  
  // For other providers or if no specific pattern, ensure it's at least 8 chars
  return apiKey.length >= 8;
};
