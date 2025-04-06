
/**
 * Mozilla TTS integration service for Bella
 * This connects to a Supabase Edge Function that processes TTS requests
 */

// Using a simulated TTS service until the Supabase Edge Function is fully implemented
// The actual implementation would call the Supabase Edge Function

// Available voices for the TTS engine
export const availableVoices = [
  { id: 'bella_young_female', name: 'Bella (Young Female)', language: 'en-US' },
  { id: 'bella_professional', name: 'Bella (Professional)', language: 'en-US' },
  { id: 'bella_warm', name: 'Bella (Warm)', language: 'en-US' },
  { id: 'bella_formal', name: 'Bella (Formal)', language: 'en-US' },
  { id: 'bella_sultry', name: 'Bella (Sultry)', language: 'en-US' },
];

export interface TTSOptions {
  voice?: string;
  pitch?: number; // 0.5 to 2.0
  rate?: number; // 0.5 to 2.0
  volume?: number; // 0 to 1.0
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

// Default options for TTS - updated for young female voice profile
const defaultOptions: TTSOptions = {
  voice: 'bella_young_female',
  pitch: 1.3, // Higher pitch for younger, feminine voice
  rate: 1.1,  // Slightly faster for youthful energy
  volume: 1.0,
};

/**
 * Synthesize speech using Mozilla TTS (simulated for now)
 * In a full implementation, this would call a Supabase Edge Function
 */
export const synthesizeSpeech = async (
  text: string,
  options: TTSOptions = {}
): Promise<TTSResponse> => {
  console.log('TTS Request:', { text, options: { ...defaultOptions, ...options } });
  
  // This is a simulated implementation using the browser's built-in speech synthesis
  // In production, this would call a Supabase Edge Function running Mozilla TTS
  
  // For now, we'll use the Web Speech API as a placeholder
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
      voice.name.toLowerCase().includes('girl')
    );
    
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Calculate estimated duration (rough estimate)
    const wordsPerMinute = 150;
    const wordCount = text.split(/\s+/).length;
    const durationInSeconds = (wordCount / wordsPerMinute) * 60;
    
    // Generate phoneme data for lip-sync
    // In a real implementation, this would come from Rhubarb Lip Sync or similar
    const phonemes = generatePhonemeData(text, durationInSeconds);
    
    // Use browser's speech synthesis as a placeholder
    window.speechSynthesis.speak(utterance);
    
    // In the real implementation, we would return an audio URL from the Edge Function
    // For now, return a simulated response with phoneme data
    resolve({
      audioUrl: 'simulated-tts-audio.mp3',
      duration: durationInSeconds,
      phonemes,
    });
  });
};

/**
 * Generate detailed phoneme data for lip-sync, simulating Rhubarb Lip Sync output
 * In a real implementation, this would come from Rhubarb Lip Sync
 */
const generatePhonemeData = (text: string, duration: number) => {
  // This is a more sophisticated simulation of phoneme data
  // Real phoneme data would come from Rhubarb Lip Sync or similar tool
  
  const phonemeMap = {
    'A': 'Open mouth (ah)',      // Open mouth
    'B': 'Slightly open (b/m/p)', // Closed lips with slight pressure, as in 'b', 'm', 'p'
    'C': 'Wide open (ah/oh)',    // Wide open, as in 'oh'
    'D': 'Rounded (o/oo)',       // Rounded lips, as in 'oo'
    'E': 'Smile/ee sound',       // Stretched lips, as in 'ee'
    'F': 'Touching teeth (f/v)', // Bottom lip touching upper teeth, as in 'f', 'v'
    'G': 'Back of throat (g/k)', // Closure at back of mouth, as in 'g', 'k'
    'H': 'Aspirated (h)',        // Slightly open with air flow, as in 'h'
    'X': 'Mouth closed'          // Neutral, closed mouth
  };
  
  const words = text.split(/\s+/);
  const phonemes = [];
  let startTime = 0;
  
  // Estimate average word duration
  const avgWordDuration = duration / words.length;
  
  // Process each word to generate more realistic phoneme timings
  for (const word of words) {
    // Word-specific duration, with slight variance based on length
    const wordDuration = avgWordDuration * (0.7 + (word.length / 10));
    
    // Identify vowels and consonants for better phoneme mapping
    const letters = word.toLowerCase().split('');
    const vowels = letters.filter(l => 'aeiou'.includes(l));
    const consonants = letters.filter(l => !('aeiou'.includes(l)));
    
    // Create phoneme segments for this word
    const phonemeCount = Math.max(2, Math.min(5, vowels.length + Math.floor(consonants.length / 2)));
    const phonemeDuration = wordDuration / phonemeCount;
    
    // Start with mouth closed
    phonemes.push({
      phoneme: 'X',
      startTime: Math.max(0, startTime - 0.05),
      endTime: startTime
    });
    
    for (let i = 0; i < phonemeCount; i++) {
      const phonemeStartTime = startTime + (i * phonemeDuration);
      const phonemeEndTime = phonemeStartTime + phonemeDuration;
      
      // Assign phonemes based on letter patterns
      let phoneme = 'X'; // Default
      
      if (word.includes('a')) phoneme = 'A';
      else if (word.includes('e') || word.includes('i')) phoneme = 'E';
      else if (word.includes('o')) phoneme = 'C';
      else if (word.includes('u')) phoneme = 'D';
      else if (word.includes('f') || word.includes('v')) phoneme = 'F';
      else if (word.includes('g') || word.includes('k')) phoneme = 'G';
      else if (word.includes('h')) phoneme = 'H';
      else if (consonants.length > vowels.length) phoneme = 'B';
      
      // For transitions, add intermediate phonemes
      if (i > 0 && i < phonemeCount - 1) {
        // Mix it up a bit for more natural mouth movement
        if (Math.random() > 0.7) {
          phoneme = ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)];
        }
      }
      
      phonemes.push({
        phoneme,
        startTime: phonemeStartTime,
        endTime: phonemeEndTime
      });
    }
    
    // End with mouth closed after word
    phonemes.push({
      phoneme: 'X',
      startTime: startTime + wordDuration,
      endTime: startTime + wordDuration + 0.05
    });
    
    startTime += wordDuration + 0.15; // Add pause between words
  }
  
  return phonemes;
};

/**
 * Cancel any ongoing speech synthesis
 */
export const cancelSpeech = (): void => {
  window.speechSynthesis.cancel();
};
