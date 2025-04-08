
import { IntentResult, BellaMood } from '@/types/bella';

export const determineMood = (intentResult: IntentResult): BellaMood => {
  // Use the detected primary emotion if available
  if (intentResult.primaryEmotion) {
    switch (intentResult.primaryEmotion) {
      case 'happy': return 'happy';
      case 'sad': return 'concerned';
      case 'angry': return 'concerned';
      case 'surprised': return 'surprised';
      case 'confused': return 'confused';
      case 'neutral': return 'neutral';
      case 'excited': return 'excited';
      case 'concerned': return 'concerned';
    }
  }
  
  // Fallback to intent-based mood determination
  const { topIntent, text } = intentResult;
  
  switch (topIntent) {
    case 'greeting':
      return 'happy';
    case 'joke':
      return 'excited';
    case 'farewell':
      return 'happy';
    case 'gratitude':
      return 'happy';
    case 'help':
      return 'concerned';
    case 'search':
      return 'thinking';
    case 'reminder':
    case 'calendar':
      return 'thinking';
    case 'weather':
      return 'neutral';
    case 'email':
    case 'contacts':
      return 'thinking';
    case 'learning_preference':
      return 'happy';
    default:
      // For other intents, check for question marks or keywords
      if (text.includes('?')) return 'curious';
      if (text.toLowerCase().includes('how') || 
          text.toLowerCase().includes('why') || 
          text.toLowerCase().includes('what')) return 'thinking';
      if (text.toLowerCase().includes('wow') || 
          text.toLowerCase().includes('amazing') || 
          text.toLowerCase().includes('awesome') ||
          text.toLowerCase().includes('great')) return 'excited';
      if (text.toLowerCase().includes('confused') || 
          text.toLowerCase().includes('i don\'t understand') || 
          text.toLowerCase().includes('what do you mean')) return 'confused';
      if (text.toLowerCase().includes('worried') || 
          text.toLowerCase().includes('concerned') || 
          text.toLowerCase().includes('problem')) return 'concerned';
      return 'neutral';
  }
};
