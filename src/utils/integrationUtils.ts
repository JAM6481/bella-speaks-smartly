
import { IntegrationType } from '@/types/bella';

// Mock functions for integration (in a real app, these would connect to actual services)
export const mockConnectIntegration = async (type: IntegrationType): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
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
