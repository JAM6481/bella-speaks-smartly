
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume, VolumeX, Play, Square, SkipForward, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { synthesizeSpeech, cancelSpeech, TTSOptions, availableVoices } from '@/utils/ttsService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface EnhancedSpeechSynthesisProps {
  text: string;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  options?: TTSOptions;
  onOptionsChange?: (options: TTSOptions) => void;
}

const EnhancedSpeechSynthesis: React.FC<EnhancedSpeechSynthesisProps> = ({
  text,
  autoPlay = false,
  onStart,
  onEnd,
  options = { voice: 'en-US-Neural2-F', volume: 0.7 },
  onOptionsChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([options.volume ? options.volume * 100 : 70]);
  const [progress, setProgress] = useState(0);
  const [showWaveform, setShowWaveform] = useState(true);
  const [enhancedQuality, setEnhancedQuality] = useState(options.enhancedQuality ?? true);
  
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
        voice: options.voice,
        volume: isMuted ? 0 : volume[0] / 100,
        rate: options.rate,
        pitch: options.pitch,
        enhancedQuality
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
      }, 50); // More frequent updates for smoother progress
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
    if (onOptionsChange) {
      onOptionsChange({
        ...options,
        volume: !isMuted ? 0 : volume[0] / 100
      });
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (onOptionsChange) {
      onOptionsChange({
        ...options,
        volume: newVolume[0] / 100
      });
    }
  };
  
  const handleVoiceChange = (value: string) => {
    if (onOptionsChange) {
      onOptionsChange({
        ...options,
        voice: value
      });
    }
  };
  
  const handleQualityToggle = (checked: boolean) => {
    setEnhancedQuality(checked);
    if (onOptionsChange) {
      onOptionsChange({
        ...options,
        enhancedQuality: checked
      });
    }
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
      {showWaveform && (
        <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <motion.div 
              className="absolute inset-0 bg-blue-500/20"
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
            
            {isPlaying && (
              <div className="flex space-x-1 absolute inset-0">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-full w-1 bg-blue-500/40"
                    initial={{ height: '10%' }}
                    animate={{ 
                      height: ['20%', `${30 + Math.random() * 70}%`, '20%'] 
                    }}
                    transition={{ 
                      duration: 0.4 + Math.random() * 0.8, 
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: i * 0.05 % 0.8
                    }}
                    style={{
                      opacity: 0.2 + Math.random() * 0.8
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="h-8 w-8 rounded-full hover:bg-blue-500/10"
                >
                  {isMuted ? 
                    <VolumeX className="h-4 w-4 text-blue-500" /> : 
                    <Volume className="h-4 w-4 text-blue-500" />
                  }
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute" : "Mute"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {!isPlaying ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startSpeech}
                    disabled={isMuted}
                    className="h-8 w-8 rounded-full hover:bg-blue-500/10"
                  >
                    <Play className="h-4 w-4 text-blue-500" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={stopSpeech}
                    className="h-8 w-8 rounded-full hover:bg-blue-500/10"
                  >
                    <Square className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {!isPlaying ? "Play" : "Stop"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipSpeech}
                  className="h-8 w-8 rounded-full hover:bg-blue-500/10"
                >
                  <SkipForward className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Skip
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="w-24 px-1">
            <Slider
              value={volume}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              className="h-4"
            />
          </div>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-500/10"
            >
              <Settings className="h-4 w-4 text-blue-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Voice Settings</h4>
              
              <div className="space-y-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select 
                  value={options.voice}
                  onValueChange={handleVoiceChange}
                >
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {availableVoices.find(v => v.id === options.voice)?.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="enhanced-quality" className="text-sm">Enhanced Quality</Label>
                <Switch
                  id="enhanced-quality"
                  checked={enhancedQuality}
                  onCheckedChange={handleQualityToggle}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="show-waveform" className="text-sm">Show Waveform</Label>
                <Switch
                  id="show-waveform"
                  checked={showWaveform}
                  onCheckedChange={setShowWaveform}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default EnhancedSpeechSynthesis;
