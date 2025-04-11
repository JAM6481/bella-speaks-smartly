
// TTS Service for Bella AI Assistant
import type { TTSOptions } from '@/types/bella';
import { detectNetworkConditions } from '@/utils/responseOptimizer';

// Re-export the TTSOptions type
export type { TTSOptions };

// Realistic voice configuration with more accurate descriptions
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
  },
  // Add browser-specific standard voices that are more likely to be available
  {
    id: 'Google US English',
    name: 'Google US',
    description: 'Standard Google US English voice'
  },
  {
    id: 'Google UK English Female',
    name: 'Google UK Female',
    description: 'Standard Google UK English female voice'
  },
  {
    id: 'Microsoft Zira Desktop - English (United States)',
    name: 'Microsoft Zira',
    description: 'Microsoft Zira female voice for English'
  },
  {
    id: 'Microsoft Zira',
    name: 'Zira',
    description: 'Microsoft Zira voice for English'
  },
  // Fallback voices with common browser identifiers
  {
    id: 'SamanthaCat',
    name: 'Samantha',
    description: 'Apple female voice (Safari only)'
  },
  {
    id: 'female',
    name: 'Default Female',
    description: 'Generic female voice'
  }
];

// Used to track the current utterance for cancellation
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Track if voices are ready to be used
let voicesReady = false;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
let failedVoiceAttempts = 0;
let lastUsedVoice: string | null = null;

// Cache browser voices to improve performance
let cachedBrowserVoices: SpeechSynthesisVoice[] = [];

/**
 * Synthesize speech from text
 */
export const synthesizeSpeech = async (
  text: string,
  options: TTSOptions
): Promise<{ duration: number }> => {
  return new Promise((resolve, reject) => {
    // First check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return resolve({ duration: 0 });
    }
    
    try {
      // Cancel any ongoing speech
      cancelSpeech();

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;

      // Set voice based on options
      const voices = getBrowserVoices();
      
      if (voices.length === 0) {
        console.warn('No voices available, using browser default');
        // Still continue with default voice rather than failing
      } else {
        // Check if the requested voice exists
        const requestedVoiceId = options.voice;
        let selectedVoice = null;
        
        console.log('Requested voice ID:', requestedVoiceId);
        console.log('Available browser voices:', voices.map(v => `${v.name} (${v.lang})`));
        
        // First try direct match with the voice ID
        selectedVoice = voices.find(v => v.name === requestedVoiceId);
        
        // If not found by direct ID, try to find by our voice list names
        if (!selectedVoice) {
          const voiceInfo = availableVoices.find(v => v.id === requestedVoiceId);
          
          if (voiceInfo) {
            // Try to find the voice in the browser's available voices
            selectedVoice = voices.find(v => 
              v.name === voiceInfo.name || 
              v.name.includes(voiceInfo.name) || 
              v.name === requestedVoiceId
            );
            
            // If we found a matching voice, log for debugging
            if (selectedVoice) {
              console.log(`Using voice: ${selectedVoice.name} for ${voiceInfo.name}`);
            }
          }
        }
        
        // If still not found, look for any female voice
        if (!selectedVoice) {
          // Look for female voices by common patterns in voice names
          selectedVoice = voices.find(v => 
            v.name.includes('female') || 
            v.name.includes('Female') ||
            v.name.includes('Zira') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google UK English Female') ||
            (v.name.includes('Google') && v.name.includes('en-US') && v.name.includes('f')) || 
            v.name.includes('Microsoft Zira')
          );
          
          if (selectedVoice) {
            console.log(`No exact match found, using female voice: ${selectedVoice.name}`);
          }
        }
        
        // If not found by name, try direct match or fallback to standard voices
        if (!selectedVoice) {
          // Try to use the last successful voice if available
          if (lastUsedVoice) {
            selectedVoice = voices.find(v => v.name === lastUsedVoice);
          }
          
          // If still not found, try common voice names
          if (!selectedVoice) {
            // Try to find common voices that are likely available
            selectedVoice = voices.find(v => 
                               v.name.includes('Google') || 
                               v.name.includes('Microsoft') ||
                               v.lang.startsWith('en')) || 
                             voices[0];
            
            failedVoiceAttempts++;
            console.warn(`Voice "${requestedVoiceId}" not found after ${failedVoiceAttempts} attempts, using fallback: ${selectedVoice?.name}`);
          }
        }
        
        // Set the voice for the utterance if we found one
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          // Remember it for future fallbacks
          lastUsedVoice = selectedVoice.name;
          console.log(`Successfully set voice to: ${selectedVoice.name}`);
        }
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
        
        // Don't reject on not-allowed errors (common in some browsers without interaction)
        if (event.error === 'not-allowed') {
          console.warn('Speech synthesis not allowed. This usually requires user interaction first.');
          resolve({ duration: 0 });
        } else {
          reject(new Error(`Speech synthesis error: ${event.error}`));
        }
      };

      // Start speaking - wrapped in a try/catch to handle permission issues
      try {
        window.speechSynthesis.speak(utterance);
      } catch (speakError) {
        console.warn('Error starting speech synthesis:', speakError);
        // Resolve with zero duration instead of failing completely
        resolve({ duration: 0 });
      }
    } catch (error) {
      console.error('Speech synthesis setup failed with error:', error);
      // Resolve with zero duration instead of rejecting
      resolve({ duration: 0 });
    }
  });
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = () => {
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
      
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    } catch (error) {
      console.warn('Error cancelling speech:', error);
    }
  }
};

/**
 * Get browser voices with caching for better performance
 */
const getBrowserVoices = (): SpeechSynthesisVoice[] => {
  if (cachedBrowserVoices.length > 0) {
    return cachedBrowserVoices;
  }
  
  if (window.speechSynthesis) {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        cachedBrowserVoices = voices;
        return voices;
      }
    } catch (error) {
      console.warn('Error getting browser voices:', error);
    }
  }
  
  return [];
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
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    return [];
  }
  
  try {
    // Try to load voices immediately
    const initialVoices = window.speechSynthesis.getVoices();
    if (initialVoices.length > 0) {
      cachedBrowserVoices = initialVoices;
      voicesReady = true;
      
      // Log available voices for debugging
      console.log('Available browser voices:', initialVoices.map(v => `${v.name} (${v.lang})`));
      return initialVoices;
    }
    
    // Wait for voices to be loaded
    await new Promise<void>((resolve) => {
      try {
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            const voices = window.speechSynthesis.getVoices();
            cachedBrowserVoices = voices;
            voicesReady = true;
            
            // Log available voices for debugging
            console.log('Available browser voices (after onvoiceschanged):', 
              voices.map(v => `${v.name} (${v.lang})`));
          } catch (error) {
            console.warn('Error in onvoiceschanged handler:', error);
          }
          resolve();
        };
      } catch (error) {
        console.warn('Error setting onvoiceschanged handler:', error);
        resolve();
      }
      
      // Fallback in case voices are already loaded or event doesn't fire
      setTimeout(() => {
        if (!voicesReady) {
          try {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              cachedBrowserVoices = voices;
              voicesReady = true;
              console.log('Available browser voices (after timeout):', 
                voices.map(v => `${v.name} (${v.lang})`));
            } else {
              console.warn('Speech synthesis voices not loaded in expected time');
              voicesReady = true;
            }
          } catch (error) {
            console.warn('Error in voice loading timeout handler:', error);
          }
          resolve();
        }
      }, 2000);
    });
    
    return cachedBrowserVoices;
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
  
  try {
    const voices = getBrowserVoices();
    return voices.some(v => 
      v.name.includes('Studio') || 
      v.name.includes('Neural') || 
      v.name.includes('Wavenet') || 
      v.name.includes('Premium')
    );
  } catch (error) {
    console.warn('Error checking for premium voices:', error);
    return false;
  }
};

/**
 * Get best available voice for a young female
 */
export const getBestYoungFemaleVoice = (): string => {
  const premiumVoices = [
    'en-US-Studio-O',    // First choice - premium studio
    'en-US-Wavenet-F',   // Second choice - wavenet
    'en-US-Neural2-C',   // Third choice - neural
    'en-US-Neural2-F',   // Fourth choice - neural
    'Microsoft Zira Desktop - English (United States)',  // Common on Windows
    'Microsoft Zira',    // Common on Windows (shorter name)
    'Google UK English Female', // Common in Chrome
    'Google US English',  // Standard Google voice as fallback
  ];
  
  // Try each voice in order of preference
  try {
    const voices = getBrowserVoices();
    console.log('Finding best female voice among:', voices.map(v => v.name));
    
    for (const voiceId of premiumVoices) {
      const voiceInfo = availableVoices.find(v => v.id === voiceId);
      if (voiceInfo) {
        const foundVoice = voices.find(v => 
          v.name === voiceInfo.name || 
          v.name.includes(voiceInfo.name) ||
          v.name === voiceId
        );
        
        if (foundVoice) {
          console.log(`Found best female voice: ${foundVoice.name}`);
          return voiceId;
        }
      }
    }
    
    // If none of the premium voices match exactly, look for any female voice by name patterns
    const femaleVoice = voices.find(v => 
      v.name.includes('female') || 
      v.name.includes('Female') ||
      v.name.includes('Zira') ||
      v.name.includes('Samantha')
    );
    
    if (femaleVoice) {
      console.log(`Found female voice by pattern: ${femaleVoice.name}`);
      // Add this voice to our available voices if it's not already there
      const existingVoice = availableVoices.find(v => v.id === femaleVoice.name);
      if (!existingVoice) {
        availableVoices.push({
          id: femaleVoice.name,
          name: femaleVoice.name,
          description: `${femaleVoice.name} (${femaleVoice.lang})`
        });
      }
      return femaleVoice.name;
    }
  } catch (error) {
    console.warn('Error finding best female voice:', error);
  }
  
  // If no premium voices found, return default
  return 'en-US-Neural2-F';
};
