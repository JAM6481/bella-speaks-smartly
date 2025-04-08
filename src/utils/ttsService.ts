
// TTS Service for Bella AI Assistant
import { TTSOptions } from '@/types/bella';

export { TTSOptions };

export const availableVoices = [
  {
    id: 'en-US-Neural2-F',
    name: 'Aria',
    description: 'A confident, articulate U.S. female voice with a professional yet approachable demeanor'
  },
  {
    id: 'en-US-Neural2-C',
    name: 'Clara',
    description: 'A clear, friendly U.S. female voice with excellent articulation'
  },
  {
    id: 'en-US-Neural2-D',
    name: 'Daniel',
    description: 'A deep, resonant male voice with a formal tone'
  },
  {
    id: 'en-US-Neural2-A',
    name: 'Anthony',
    description: 'A warm, natural-sounding male voice'
  },
  {
    id: 'en-US-Neural2-E',
    name: 'Emma',
    description: 'A bright, cheerful female voice with a younger tone'
  },
  {
    id: 'en-US-Neural2-B',
    name: 'Brian',
    description: 'A smooth, professional male voice with clear diction'
  },
  {
    id: 'en-GB-Neural2-B',
    name: 'Oliver',
    description: 'A British male voice with a formal, intelligent tone'
  },
  {
    id: 'en-GB-Neural2-A',
    name: 'Sophie',
    description: 'A British female voice with a warm, friendly quality'
  },
  {
    id: 'en-AU-Neural2-A',
    name: 'Charlotte',
    description: 'An Australian female voice with a pleasant, upbeat tone'
  },
  {
    id: 'en-AU-Neural2-B',
    name: 'James',
    description: 'An Australian male voice with a confident, relaxed quality'
  }
];

// Used to track the current utterance for cancellation
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Synthesize speech from text
 */
export const synthesizeSpeech = async (
  text: string,
  options: TTSOptions
): Promise<{ duration: number }> => {
  return new Promise((resolve, reject) => {
    try {
      // Cancel any ongoing speech
      cancelSpeech();

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      // Set voice based on options
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === options.voice) || voices[0];
      utterance.voice = selectedVoice;

      // Set other speech properties
      utterance.volume = options.volume;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;

      // Approximate duration (average reading speed is about 150 words per minute)
      const words = text.split(/\s+/).length;
      const durationInSeconds = (words / 150) * 60;

      // Event handlers
      utterance.onend = () => {
        currentUtterance = null;
        resolve({ duration: durationInSeconds });
      };

      utterance.onerror = (event) => {
        currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

/**
 * Preload voices to ensure they're available
 */
export const preloadVoices = async () => {
  try {
    if ('speechSynthesis' in window) {
      // Wait for voices to be loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        await new Promise<void>((resolve) => {
          window.speechSynthesis.onvoiceschanged = () => {
            resolve();
          };
        });
      }
      return window.speechSynthesis.getVoices();
    }
    return [];
  } catch (error) {
    console.error('Error loading voices:', error);
    return [];
  }
};
