
import React, { useState, useEffect, useCallback } from 'react';
import { synthesizeSpeech, cancelSpeech, TTSOptions } from '@/utils/ttsService';
import PlaybackIndicator from '@/components/speech/PlaybackIndicator';
import SpeechControls from '@/components/speech/SpeechControls';
import VoiceSelector from '@/components/speech/VoiceSelector';

interface EnhancedSpeechSynthesisProps {
  text: string;
  autoPlay?: boolean;
  options: TTSOptions;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const EnhancedSpeechSynthesis: React.FC<EnhancedSpeechSynthesisProps> = ({
  text,
  autoPlay = false,
  options,
  onEnd,
  onError
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(options.volume || 0.7);
  const [error, setError] = useState<Error | null>(null);
  const [showControls, setShowControls] = useState(false);

  // Clean up function to cancel any ongoing speech
  const cleanup = useCallback(() => {
    if (isPlaying) {
      cancelSpeech();
      setIsPlaying(false);
    }
  }, [isPlaying]);

  // Cancel speech synthesis when component unmounts
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Play speech when autoPlay is true or when options change
  useEffect(() => {
    if (autoPlay && text) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  const handlePlay = async () => {
    try {
      cleanup();
      setError(null);

      // Use current volume state for speech
      const speechOptions = {
        ...options,
        volume: isMuted ? 0 : volume
      };

      setIsPlaying(true);
      const result = await synthesizeSpeech(text, speechOptions);
      
      // Speech completed successfully
      setIsPlaying(false);
      if (onEnd) onEnd();
    } catch (err) {
      setIsPlaying(false);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (onError) onError(error);
      console.error('Speech synthesis error:', error);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      cleanup();
    } else {
      handlePlay();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    // If currently playing, update the volume immediately
    if (isPlaying) {
      cancelSpeech();
      
      // Resume with new volume setting
      setTimeout(() => {
        handlePlay();
      }, 50);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    
    // If currently playing, update the volume immediately
    if (isPlaying) {
      cancelSpeech();
      
      // Resume with new volume setting
      setTimeout(() => {
        handlePlay();
      }, 50);
    }
  };
  
  const handleVoiceChange = (voiceId: string) => {
    // Update the TTS options with the new voice
    options.voice = voiceId;
    
    // If currently playing, restart speech with new voice
    if (isPlaying) {
      cancelSpeech();
      
      // Resume with new voice
      setTimeout(() => {
        handlePlay();
      }, 50);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isPlaying && setShowControls(false)}
    >
      <PlaybackIndicator isPlaying={isPlaying} text={text} />
      
      <div className="flex justify-between items-center">
        <SpeechControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          showControls={showControls || isPlaying}
        />
        
        <VoiceSelector
          currentVoice={options.voice}
          onVoiceChange={handleVoiceChange}
          disabled={isPlaying}
        />
      </div>
      
      {error && (
        <div className="text-xs text-red-500 mt-1">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default EnhancedSpeechSynthesis;
