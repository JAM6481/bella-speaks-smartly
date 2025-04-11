
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
  const [speechSupported, setSpeechSupported] = useState(true);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
      setError(new Error('Speech synthesis is not supported in this browser'));
      if (onError) onError(new Error('Speech synthesis is not supported in this browser'));
    }
  }, [onError]);

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
    if (autoPlay && text && speechSupported) {
      handlePlay();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text, speechSupported]);

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
      
      // If speech duration is 0, it means it failed silently (permissions/not-allowed/etc)
      if (result.duration === 0) {
        console.warn('Speech synthesis completed with zero duration - likely failed silently');
        
        // Don't show an error to the user for permission issues
        setIsPlaying(false);
        if (onEnd) onEnd();
        return;
      }
      
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

  // Don't render controls if speech synthesis is not supported
  if (!speechSupported) {
    return null;
  }

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
          {error.message.includes('not-allowed') 
            ? 'Speech requires user interaction first. Click play to enable speech.'
            : `Error: ${error.message}`}
        </div>
      )}
    </div>
  );
};

export default EnhancedSpeechSynthesis;
