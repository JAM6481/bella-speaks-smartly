
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

export interface IntentResult {
  text: string;
  topIntent: string;
  entities: Array<{
    entity: string;
    value: string;
  }>;
  primaryEmotion?: string;
  contextualMemory?: {
    userPreferences?: Record<string, any>;
    recentTopics?: string[];
  };
}

export type BellaMood = 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused';
