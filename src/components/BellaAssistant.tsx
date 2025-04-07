
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Moon, Sun, Trash2, Sliders } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BellaAvatar from '@/components/BellaAvatar';
import ChatInterface from '@/components/ChatInterface';
import { useBella } from '@/context/BellaContext';
import { useToast } from '@/hooks/use-toast';
import { availableVoices } from '@/utils/ttsService';

const BellaAssistant: React.FC = () => {
  const { messages, isThinking, isTalking, mood, ttsOptions, sendMessage, clearMessages, updateTTSOptions } = useBella();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState([ttsOptions.volume ? ttsOptions.volume * 100 : 70]);
  const { toast } = useToast();

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  const toggleMute = () => {
    setMuted(!muted);
    updateTTSOptions({ volume: muted ? volume[0] / 100 : 0 });
    toast({
      title: muted ? "Voice enabled" : "Voice muted",
      description: muted ? "Bella will now speak her responses." : "Bella will no longer speak responses aloud.",
    });
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    updateTTSOptions({ volume: value[0] / 100 });
    toast({
      title: "Volume adjusted",
      description: `Volume set to ${value[0]}%`,
    });
  };
  
  const handlePitchChange = (value: number[]) => {
    updateTTSOptions({ pitch: value[0] / 100 * 2 }); // Scale to 0-2 range
    toast({
      title: "Pitch adjusted",
      description: `Pitch set to ${value[0]}%`,
    });
  };
  
  const handleRateChange = (value: number[]) => {
    updateTTSOptions({ rate: value[0] / 100 * 2 }); // Scale to 0-2 range
    toast({
      title: "Speaking rate adjusted",
      description: `Speaking rate set to ${value[0]}%`,
    });
  };
  
  const handleVoiceChange = (value: string) => {
    updateTTSOptions({ voice: value });
    toast({
      title: "Voice changed",
      description: `Voice set to ${availableVoices.find(v => v.id === value)?.name || value}`,
    });
  };

  return (
    <div className={`min-h-screen bella-gradient-bg flex flex-col items-center`}>
      <motion.header 
        className="w-full py-4 px-6 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
          Bella <span className="text-blue-500">AI</span> Assistant
        </h1>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMute}
            className="rounded-full hover:bg-blue-500/10"
          >
            {muted ? <VolumeX className="h-5 w-5 text-blue-500" /> : <Volume2 className="h-5 w-5 text-blue-500" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-blue-500/10"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-blue-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-blue-500/10"
              >
                <Sliders className="h-5 w-5 text-blue-500" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Voice Settings</SheetTitle>
                <SheetDescription>
                  Customize Bella's voice to your preference
                </SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="voice-select">Voice</Label>
                  <Select 
                    onValueChange={handleVoiceChange} 
                    defaultValue={ttsOptions.voice}
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
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="pitch-slider">Pitch</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((ttsOptions.pitch || 1) * 50)}%
                    </span>
                  </div>
                  <Slider
                    id="pitch-slider"
                    defaultValue={[ttsOptions.pitch ? ttsOptions.pitch * 50 : 50]}
                    onValueChange={handlePitchChange}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-slider">Speaking Rate</Label>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((ttsOptions.rate || 1) * 50)}%
                    </span>
                  </div>
                  <Slider
                    id="rate-slider"
                    defaultValue={[ttsOptions.rate ? ttsOptions.rate * 50 : 50]}
                    onValueChange={handleRateChange}
                    max={100}
                    step={1}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    onClick={clearMessages}
                    className="w-full"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Conversation
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-blue-500/10"
              >
                <Settings className="h-5 w-5 text-blue-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="px-2 py-2">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="voice" className="text-sm font-medium">Voice Output</Label>
                  <Switch 
                    id="voice" 
                    checked={!muted} 
                    onCheckedChange={() => toggleMute()} 
                  />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="volume" className="text-sm font-medium">Volume</Label>
                    <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                  </div>
                  <Slider
                    id="volume"
                    disabled={muted}
                    value={volume}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className={`${muted ? 'opacity-50' : ''}`}
                  />
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={clearMessages} className="text-red-500 focus:text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
      
      <main className="flex-1 w-full max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center justify-center gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 flex justify-center"
        >
          <BellaAvatar 
            isTalking={isTalking} 
            isThinking={isThinking}
            mood={mood}
          />
        </motion.div>
        
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1 w-full md:w-auto"
        >
          <ChatInterface 
            onSendMessage={sendMessage} 
            messages={messages}
            isThinking={isThinking}
            ttsOptions={ttsOptions}
          />
        </motion.div>
      </main>
      
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full py-4 text-center text-sm text-blue-700/60 dark:text-blue-300/60"
      >
        <p>Bella AI Assistant © 2025 | Built with React + TailwindCSS</p>
      </motion.footer>
    </div>
  );
};

export default BellaAssistant;
