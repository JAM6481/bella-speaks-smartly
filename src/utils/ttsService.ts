/**
 * Enhanced TTS service for Bella
 * This connects to a Supabase Edge Function that processes TTS requests
 */

// Enhanced voice options for a more natural and premium experience
export const availableVoices = [
  { 
    id: 'bella_professional', 
    name: 'Bella Professional', 
    language: 'en-US', 
    description: 'A confident, articulate voice with a professional yet approachable demeanor, and a subtle, captivating charm. Perfect for a premium AI assistant.'
  },
  { 
    id: 'bella_premium', 
    name: 'Bella Premium', 
    language: 'en-US', 
    description: 'A warm, confident voice with natural intonation and clarity.' 
  },
  { 
    id: 'bella_warm', 
    name: 'Bella Warm', 
    language: 'en-US', 
    description: 'A friendly, approachable voice with emotional range and warmth.' 
  },
  { 
    id: 'bella_formal', 
    name: 'Bella Formal', 
    language: 'en-US', 
    description: 'A precise, structured voice that conveys expertise and reliability.' 
  },
  { 
    id: 'bella_casual', 
    name: 'Bella Casual', 
    language: 'en-US', 
    description: 'A relaxed, conversational voice that feels like talking to a friend.' 
  },
  { 
    id: 'bella_cheerful', 
    name: 'Bella Cheerful', 
    language: 'en-US', 
    description: 'An upbeat, positive voice that conveys enthusiasm and energy.' 
  },
  { 
    id: 'bella_gentle', 
    name: 'Bella Gentle', 
    language: 'en-US', 
    description: 'A soft, soothing voice perfect for calming content and guidance.' 
  },
];

export interface TTSOptions {
  voice?: string;
  pitch?: number; // 0.5 to 2.0
  rate?: number; // 0.5 to 2.0
  volume?: number; // 0 to 1.0
  enhancedQuality?: boolean; // Higher quality with more computational cost
  accent?: string; // Added for more voice customization
  age?: string; // Added for more voice customization
  style?: string; // Added for more voice customization
  personality?: string; // Added for more voice customization
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  phonemes?: Array<{
    phoneme: string;
    startTime: number;
    endTime: number;
  }>;
}

// Default options for TTS - updated for premium voice profile
const defaultOptions: TTSOptions = {
  voice: 'bella_premium',
  pitch: 1.1, // Slightly higher pitch for clarity
  rate: 1.0,  // Standard rate for natural speaking
  volume: 1.0,
  enhancedQuality: true, // Enable enhanced quality by default
  accent: 'neutral',
  age: 'adult',
  style: 'neutral',
  personality: 'neutral'
};

/**
 * Synthesize speech using enhanced TTS engine
 * In a full implementation, this would call a Supabase Edge Function
 */
export const synthesizeSpeech = async (
  text: string,
  options: TTSOptions = {}
): Promise<TTSResponse> => {
  console.log('TTS Request:', { text, options: { ...defaultOptions, ...options } });
  
  // This is a simulated implementation using the browser's built-in speech synthesis
  // In production, this would call a Supabase Edge Function running a high-quality TTS engine
  
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || defaultOptions.rate!;
    utterance.pitch = options.pitch || defaultOptions.pitch!;
    utterance.volume = options.volume || defaultOptions.volume!;
    
    // Try to use a female voice if available
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('woman') ||
      voice.name.toLowerCase().includes('girl') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('lisa')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Calculate estimated duration with more accurate algorithm
    const wordsPerMinute = options.rate ? 150 / options.rate : 150;
    const wordCount = text.split(/\s+/).length;
    
    // Add time for pauses at punctuation
    const punctuationCount = (text.match(/[.,;:!?]/g) || []).length;
    const pauseTimeForPunctuation = punctuationCount * 0.2; // 200ms pause per punctuation mark
    
    const durationInSeconds = (wordCount / wordsPerMinute) * 60 + pauseTimeForPunctuation;
    
    // Generate detailed phoneme data for lip-sync
    const phonemes = generateEnhancedPhonemeData(text, durationInSeconds);
    
    // Use browser's speech synthesis
    window.speechSynthesis.speak(utterance);
    
    // In the real implementation, we would return an audio URL from the Edge Function
    resolve({
      audioUrl: 'simulated-tts-audio.mp3',
      duration: durationInSeconds,
      phonemes,
    });
  });
};

/**
 * Generate detailed phoneme data for lip-sync with advanced patterns
 */
const generateEnhancedPhonemeData = (text: string, duration: number) => {
  // Enhanced phoneme mapping for more realistic mouth movements
  const phonemeMap = {
    'A': 'Open mouth (ah)',     
    'B': 'Slightly open (b/m/p)', 
    'C': 'Wide open (ah/oh)',    
    'D': 'Rounded (o/oo)',       
    'E': 'Smile/ee sound',      
    'F': 'Touching teeth (f/v)', 
    'G': 'Back of throat (g/k)', 
    'H': 'Aspirated (h)',        
    'I': 'Small open (ih)',       
    'J': 'Rounded with jaw drop (aw)',
    'X': 'Mouth closed'          
  };
  
  const words = text.split(/\s+/);
  const phonemes = [];
  let startTime = 0;
  
  // Convert text to phonemes with natural timing variations
  const avgWordDuration = duration / words.length;
  
  // Add initial mouth closed state
  phonemes.push({
    phoneme: 'X',
    startTime: 0,
    endTime: 0.1
  });
  
  startTime = 0.1;
  
  // Process each word for more realistic phoneme mapping
  for (const word of words) {
    // Word-specific duration with variance based on length and punctuation
    const hasPunctuation = /[.,;:!?]$/.test(word);
    const emphasisMultiplier = word.endsWith('!') ? 1.2 : 1.0;
    const pauseMultiplier = hasPunctuation ? 1.3 : 1.0;
    
    const wordDuration = avgWordDuration * 
      (0.8 + (word.length / 10)) * 
      emphasisMultiplier;
    
    // Identify phonetic components
    const letters = word.toLowerCase().replace(/[^a-z]/g, '').split('');
    const vowels = letters.filter(l => 'aeiou'.includes(l));
    const consonants = letters.filter(l => !('aeiou'.includes(l)));
    
    // Create phoneme segments with more natural timing
    const phonemeCount = Math.max(2, Math.min(word.length, vowels.length * 2 + Math.floor(consonants.length / 2)));
    const phonemeDuration = wordDuration / phonemeCount;
    
    for (let i = 0; i < phonemeCount; i++) {
      const phonemeStartTime = startTime + (i * phonemeDuration);
      const phonemeEndTime = phonemeStartTime + phonemeDuration;
      
      // Assign phonemes based on letter patterns with more variation
      let phoneme = 'X'; // Default
      
      if (i === 0 && consonants.length > 0) {
        // First consonant handling
        const firstConsonant = consonants[0];
        if ('bmp'.includes(firstConsonant)) phoneme = 'B';
        else if ('fv'.includes(firstConsonant)) phoneme = 'F';
        else if ('gk'.includes(firstConsonant)) phoneme = 'G';
        else if (firstConsonant === 'h') phoneme = 'H';
        else phoneme = 'X';
      } else if (vowels.length > 0) {
        // Vowel handling with more nuance
        const vowelIndex = Math.min(i - (consonants.length > 0 ? 1 : 0), vowels.length - 1);
        if (vowelIndex >= 0) {
          const vowel = vowels[vowelIndex];
          if (vowel === 'a') phoneme = 'A';
          else if (vowel === 'e') phoneme = 'E';
          else if (vowel === 'i') phoneme = 'I';
          else if (vowel === 'o') phoneme = 'D';
          else if (vowel === 'u') phoneme = 'D';
        }
      }
      
      // For transitions between sounds, add intermediate phonemes
      if (i > 0 && i < phonemeCount - 1 && Math.random() > 0.5) {
        phoneme = Object.keys(phonemeMap)[Math.floor(Math.random() * (Object.keys(phonemeMap).length - 1))];
      }
      
      phonemes.push({
        phoneme,
        startTime: phonemeStartTime,
        endTime: phonemeEndTime
      });
    }
    
    // Add pause after word, longer if there's punctuation
    const pauseDuration = hasPunctuation ? 0.25 : 0.1;
    
    // Add mouth closed at end of word
    phonemes.push({
      phoneme: 'X',
      startTime: startTime + wordDuration,
      endTime: startTime + wordDuration + pauseDuration
    });
    
    startTime += wordDuration + pauseDuration;
  }
  
  return phonemes;
};

/**
 * Cancel any ongoing speech synthesis
 */
export const cancelSpeech = (): void => {
  window.speechSynthesis.cancel();
};

/**
 * Preload voices to ensure they're available when needed
 * Call this early in the application lifecycle
 */
export const preloadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    
    const voicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
      resolve();
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);
    
    // Force voice loading by making a silent speech request
    const silentUtterance = new SpeechSynthesisUtterance('');
    silentUtterance.volume = 0;
    window.speechSynthesis.speak(silentUtterance);
  });
};
