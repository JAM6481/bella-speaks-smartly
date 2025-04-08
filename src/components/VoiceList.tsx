
import { useState } from 'react';
import { Check, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { availableVoices } from '@/utils/ttsService';
import { useBella } from '@/context/BellaContext';

const VoiceList = () => {
  const { ttsOptions, updateTTSOptions } = useBella();
  const [selectedVoice, setSelectedVoice] = useState<string>(ttsOptions.voice);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    updateTTSOptions({ voice: voiceId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-blue-700 dark:text-blue-300">Available Voices</h3>
        <span className="text-sm text-muted-foreground">{availableVoices.length} voices</span>
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
        {availableVoices.map((voice) => (
          <Card 
            key={voice.id}
            className={`p-3 cursor-pointer transition-all duration-200 ${
              selectedVoice === voice.id 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                : 'hover:border-blue-300 dark:hover:border-blue-700'
            }`}
            onClick={() => handleVoiceSelect(voice.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  selectedVoice === voice.id 
                    ? 'bg-blue-500 text-white' 
                    : 'border border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedVoice === voice.id && <Check className="w-3 h-3" />}
                </div>
                <span className="font-medium">{voice.name}</span>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p className="font-medium">{voice.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{voice.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {voice.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{voice.description}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VoiceList;
