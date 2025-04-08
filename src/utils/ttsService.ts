// This is just a placeholder, as the actual ttsService.ts is read-only
// and cannot be modified directly. This placeholder is present so 
// our VoiceList component can import from this file.

// New voices would normally be added here, but since we can't edit the file,
// the existing voices from the read-only file will be used.

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

// Re-export preloadVoices to maintain compatibility
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
