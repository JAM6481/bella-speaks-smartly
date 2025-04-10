
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { availableVoices } from '@/utils/ttsService';

interface VoiceSelectorProps {
  currentVoice: string;
  onVoiceChange: (voice: string) => void;
  disabled?: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  currentVoice, 
  onVoiceChange,
  disabled = false
}) => {
  // Find the current voice info
  const currentVoiceInfo = availableVoices.find(v => v.id === currentVoice);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs gap-1 h-7 px-2 rounded-full text-blue-700 border-blue-300 hover:bg-blue-50"
        >
          <span className="truncate max-w-[80px]">
            {currentVoiceInfo ? currentVoiceInfo.name : 'Select Voice'}
          </span>
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {availableVoices.map(voice => (
          <DropdownMenuItem 
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className="flex flex-col items-start"
          >
            <span className="font-medium">{voice.name}</span>
            <span className="text-xs text-gray-500">{voice.description}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default VoiceSelector;
