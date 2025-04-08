
// TTS Service for Bella AI Assistant
import type { TTSOptions } from '@/types/bella';

// Re-export the TTSOptions type
export type { TTSOptions };

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

// Track if voices are ready to be used
let voicesReady = false;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

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
      
      // Check if the requested voice exists
      const requestedVoiceId = options.voice;
      let selectedVoice = null;
      
      // First try to find by ID match (from our availableVoices)
      const voiceInfo = availableVoices.find(v => v.id === requestedVoiceId);
      
      if (voiceInfo) {
        // Try to find the voice in the browser's available voices
        selectedVoice = voices.find(v => 
          v.name === voiceInfo.name || 
          v.name.includes(voiceInfo.name) || 
          v.name === requestedVoiceId
        );
      }
      
      // If not found by name, try direct match or fallback to any voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.name === requestedVoiceId) || 
                        voices.find(v => v.lang === 'en-US') || 
                        voices[0];
        
        console.log(`Voice "${requestedVoiceId}" not found, using fallback: ${selectedVoice?.name}`);
      }
      
      utterance.voice = selectedVoice;

      // Set other speech properties
      utterance.volume = options.volume;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;

      // Approximate duration (average reading speed is about 150 words per minute)
      const words = text.split(/\s+/).length;
      const durationInSeconds = (words / 150) * 60;

      // Fallback timer in case onend doesn't fire (which happens sometimes)
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      
      fallbackTimer = setTimeout(() => {
        if (currentUtterance === utterance) {
          currentUtterance = null;
          resolve({ duration: durationInSeconds });
          console.log('Speech completion detected by fallback timer');
        }
      }, (durationInSeconds * 1000) + 2000); // Add 2 second buffer

      // Event handlers
      utterance.onend = () => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        currentUtterance = null;
        resolve({ duration: durationInSeconds });
      };

      utterance.onerror = (event) => {
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        currentUtterance = null;
        console.error(`Speech synthesis error: ${event.error}`);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis failed with error:', error);
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
    
    if (fallbackTimer) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }
  }
};

/**
 * Get voice by ID or name, with fallback
 */
export const getVoiceById = (voiceId: string): string => {
  const voiceInfo = availableVoices.find(v => v.id === voiceId);
  return voiceInfo ? voiceInfo.id : availableVoices[0].id;
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
            voicesReady = true;
            resolve();
          };
          
          // Fallback in case voices are already loaded or event doesn't fire
          setTimeout(() => {
            if (!voicesReady && window.speechSynthesis.getVoices().length > 0) {
              voicesReady = true;
              resolve();
            } else if (!voicesReady) {
              console.warn('Speech synthesis voices not loaded in expected time');
              voicesReady = true;
              resolve();
            }
          }, 2000);
        });
      } else {
        voicesReady = true;
      }
      return window.speechSynthesis.getVoices();
    }
    return [];
  } catch (error) {
    console.error('Error loading voices:', error);
    return [];
  }
};
