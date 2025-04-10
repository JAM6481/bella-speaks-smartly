
import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { TTSOptions } from '@/utils/ttsService';

interface SpeechControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  togglePlay: () => void;
  toggleMute: () => void;
  handleVolumeChange: (value: number[]) => void;
  showControls: boolean;
}

const SpeechControls: React.FC<SpeechControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  togglePlay,
  toggleMute,
  handleVolumeChange,
  showControls
}) => {
  if (!showControls) return null;
  
  return (
    <div className="flex items-center gap-2 mt-1">
      <Button 
        type="button" 
        size="icon" 
        variant="ghost" 
        onClick={togglePlay}
        className="h-8 w-8 text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </Button>
      
      <Button 
        type="button" 
        size="icon" 
        variant="ghost" 
        onClick={toggleMute}
        className="h-8 w-8 text-blue-700 hover:text-blue-900 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </Button>
      
      <div className="w-24">
        <Slider 
          value={[isMuted ? 0 : volume * 100]} 
          min={0} 
          max={100} 
          step={1}
          onValueChange={handleVolumeChange}
          className="h-1"
        />
      </div>
    </div>
  );
};

export default SpeechControls;
