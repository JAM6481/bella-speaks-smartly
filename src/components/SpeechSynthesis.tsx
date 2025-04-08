
import React, { useEffect, useRef, useState } from 'react';
import { Volume, VolumeX, Play, Square, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { synthesizeSpeech, cancelSpeech, TTSOptions } from '@/utils/ttsService';

interface SpeechSynthesisProps {
  text: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  options?: TTSOptions;
}

const SpeechSynthesis: React.FC<SpeechSynthesisProps> = ({
  text,
  autoPlay = false,
  onStart,
  onEnd,
  options = { voice: 'en-US-Neural2-F', volume: 0.7 },
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([options.volume ? options.volume * 100 : 70]);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  const startSpeech = async () => {
    if (!text.trim()) return;
    
    try {
      // Stop any previous speech
      cancelSpeech();
      
      // Update UI state
      setIsPlaying(true);
      setProgress(0);
      startTimeRef.current = Date.now();
      if (onStart) onStart();
      
      // Start speech synthesis
      const speechOptions: TTSOptions = {
        ...options,
        volume: volume[0] / 100,
      };
      
      const response = await synthesizeSpeech(text, speechOptions);
      durationRef.current = response.duration;
      
      // Set up progress tracking
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      
      progressInterval.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const newProgress = Math.min(100, (elapsed / durationRef.current) * 100);
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          handleSpeechEnd();
        }
      }, 100);
    } catch (error) {
      console.error('Error starting speech synthesis:', error);
      handleSpeechEnd();
    }
  };
  
  const handleSpeechEnd = () => {
    setIsPlaying(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    if (onEnd) onEnd();
  };
  
  const stopSpeech = () => {
    cancelSpeech();
    handleSpeechEnd();
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      cancelSpeech();
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
  };
  
  const skipSpeech = () => {
    stopSpeech();
    setProgress(100);
  };
  
  useEffect(() => {
    // Auto-play if enabled and not muted
    if (autoPlay && !isMuted && text) {
      startSpeech();
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      cancelSpeech();
    };
  }, [text, autoPlay, isMuted]);
  
  if (!text) return null;
  
  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
        <div 
          className="bg-bella-purple h-1.5 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="rounded-full hover:bg-bella-purple/10"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? 
            <VolumeX className="h-4 w-4 text-bella-purple" /> : 
            <Volume className="h-4 w-4 text-bella-purple" />
          }
        </Button>
        
        {!isPlaying ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={startSpeech}
            disabled={isMuted}
            className="rounded-full hover:bg-bella-purple/10"
            title="Play"
          >
            <Play className="h-4 w-4 text-bella-purple" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={stopSpeech}
            className="rounded-full hover:bg-bella-purple/10"
            title="Stop"
          >
            <Square className="h-4 w-4 text-bella-purple" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={skipSpeech}
          className="rounded-full hover:bg-bella-purple/10"
          title="Skip"
        >
          <SkipForward className="h-4 w-4 text-bella-purple" />
        </Button>
        
        <div className="w-20">
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default SpeechSynthesis;
