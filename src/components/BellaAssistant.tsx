
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Volume2, VolumeX, Moon, Sun, Trash2 } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import BellaAvatar from '@/components/BellaAvatar';
import ChatInterface from '@/components/ChatInterface';
import { useBella } from '@/context/BellaContext';
import { useToast } from '@/components/ui/use-toast';

const BellaAssistant: React.FC = () => {
  const { messages, isThinking, isTalking, mood, sendMessage, clearMessages } = useBella();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState([70]);
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
    toast({
      title: muted ? "Voice enabled" : "Voice muted",
      description: muted ? "Bella will now speak her responses." : "Bella will no longer speak responses aloud.",
    });
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    toast({
      title: "Volume adjusted",
      description: `Volume set to ${value[0]}%`,
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
        <h1 className="text-2xl md:text-3xl font-bold text-bella-deepPurple dark:text-bella-lightPurple">
          Bella <span className="text-bella-accent">AI</span> Assistant
        </h1>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMute}
            className="rounded-full hover:bg-bella-purple/10"
          >
            {muted ? <VolumeX className="h-5 w-5 text-bella-purple" /> : <Volume2 className="h-5 w-5 text-bella-purple" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-bella-purple/10"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-bella-purple" /> : <Moon className="h-5 w-5 text-bella-purple" />}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-bella-purple/10"
              >
                <Settings className="h-5 w-5 text-bella-purple" />
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
          />
        </motion.div>
      </main>
      
      <motion.footer
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="w-full py-4 text-center text-sm text-bella-deepPurple/60 dark:text-bella-lightPurple/60"
      >
        <p>Bella AI Assistant © 2025 | Built with React + TailwindCSS</p>
      </motion.footer>
    </div>
  );
};

export default BellaAssistant;
