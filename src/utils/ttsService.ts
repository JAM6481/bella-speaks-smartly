
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
    id: 'en-US-Wavenet-F',
    name: 'Emma',
    description: 'A bright, cheerful younger female voice with natural inflections and warmth'
  },
  {
    id: 'en-US-Wavenet-C',
    name: 'Sofia',
    description: 'A smooth, youthful female voice with a natural conversational quality'
  },
  {
    id: 'en-US-Studio-O',
    name: 'Olivia',
    description: 'A premium studio-quality young female voice with exceptional clarity and warmth'
  },
  {
    id: 'en-US-Polyglot-1',
    name: 'Zoe',
    description: 'A versatile, natural-sounding young female voice with excellent pronunciation'
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
    id: 'en-GB-Neural2-B',
    name: 'Oliver',
    description: 'A British male voice with a formal, intelligent tone'
  },
  {
    id: 'en-GB-Neural2-A',
    name: 'Sophie',
    description: 'A British female voice with a warm, friendly quality'
  }
];

// Used to track the current utterance for cancellation
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Track if voices are ready to be used
let voicesReady = false;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
let failedVoiceAttempts = 0;
let lastUsedVoice: string | null = null;

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
      
      // If not found by name, try direct match or fallback
      if (!selectedVoice) {
        // Try to use the last successful voice if available
        if (lastUsedVoice) {
          selectedVoice = voices.find(v => v.name === lastUsedVoice);
        }
        
        // If still not found, use any feminine voice as fallback
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.name.includes('female') || v.name.includes('Female')) || 
                          voices.find(v => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('female'))) || 
                          voices.find(v => v.lang === 'en-US') || 
                          voices[0];
          
          failedVoiceAttempts++;
          console.warn(`Voice "${requestedVoiceId}" not found after ${failedVoiceAttempts} attempts, using fallback: ${selectedVoice?.name}`);
        }
      }
      
      utterance.voice = selectedVoice;
      
      // If we successfully set a voice, remember it for future fallbacks
      if (selectedVoice) {
        lastUsedVoice = selectedVoice.name;
      }

      // Apply enhanced quality settings
      if (options.enhancedQuality) {
        // Adjust parameters for higher quality speech
        utterance.rate = (options.rate || 1) * 0.95; // Slightly slower for better articulation
        utterance.pitch = (options.pitch || 1) * 1.05; // Slightly higher for a younger female voice
      } else {
        // Use standard settings
        utterance.rate = options.rate || 1;
        utterance.pitch = options.pitch || 1;
      }
      
      // Set volume
      utterance.volume = options.volume;

      // Approximate duration (average reading speed is about 150 words per minute)
      const words = text.split(/\s+/).length;
      const effectiveRate = utterance.rate || 1;
      const durationInSeconds = (words / (150 * effectiveRate)) * 60;

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
  // Return the premium quality young female voice as default
  return voiceInfo ? voiceInfo.id : 'en-US-Studio-O';
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

/**
 * Check if premium voices are available
 */
export const arePremiumVoicesAvailable = (): boolean => {
  if (!window.speechSynthesis) return false;
  
  const voices = window.speechSynthesis.getVoices();
  return voices.some(v => 
    v.name.includes('Studio') || 
    v.name.includes('Neural') || 
    v.name.includes('Wavenet') || 
    v.name.includes('Premium')
  );
};

/**
 * Get best available voice for a young female
 */
export const getBestYoungFemaleVoice = (): string => {
  const premiumVoices = [
    'en-US-Studio-O',    // First choice - premium studio
    'en-US-Wavenet-F',   // Second choice - wavenet
    'en-US-Neural2-C',   // Third choice - neural
    'en-US-Neural2-F'    // Fourth choice - neural
  ];
  
  // Try each voice in order of preference
  const voices = window.speechSynthesis.getVoices();
  
  for (const voiceId of premiumVoices) {
    const voiceInfo = availableVoices.find(v => v.id === voiceId);
    if (voiceInfo) {
      const foundVoice = voices.find(v => 
        v.name === voiceInfo.name || 
        v.name.includes(voiceInfo.name)
      );
      
      if (foundVoice) {
        return voiceId;
      }
    }
  }
  
  // If no premium voices found, return default
  return 'en-US-Neural2-F';
};
