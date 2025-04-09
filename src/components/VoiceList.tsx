
import { useState, useEffect } from 'react';
import { Check, Info, Crown, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { availableVoices, getBestYoungFemaleVoice } from '@/utils/ttsService';
import { useBella } from '@/context/BellaContext';

const VoiceList = () => {
  const { ttsOptions, updateTTSOptions } = useBella();
  const [selectedVoice, setSelectedVoice] = useState<string>(ttsOptions.voice);
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedVoice, setRecommendedVoice] = useState<string | null>(null);

  // Get recommended voice on component mount
  useEffect(() => {
    const bestVoice = getBestYoungFemaleVoice();
    setRecommendedVoice(bestVoice);
    
    // If the current voice isn't set or is the default, set it to the best available
    if (!ttsOptions.voice || ttsOptions.voice === 'en-US-Neural2-F') {
      handleVoiceSelect(bestVoice);
    }
  }, []);

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    updateTTSOptions({ voice: voiceId });
  };

  // Filter voices based on search query
  const filteredVoices = availableVoices.filter(voice => 
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort voices to show recommended first, then premium, then by name
  const sortedVoices = [...filteredVoices].sort((a, b) => {
    // Put recommended voice at the top
    if (a.id === recommendedVoice) return -1;
    if (b.id === recommendedVoice) return 1;
    
    // Then sort premium voices (Studio, Wavenet, Neural) before others
    const aIsPremium = a.id.includes('Studio') || a.id.includes('Wavenet') || a.id.includes('Neural');
    const bIsPremium = b.id.includes('Studio') || b.id.includes('Wavenet') || b.id.includes('Neural');
    
    if (aIsPremium && !bIsPremium) return -1;
    if (!aIsPremium && bIsPremium) return 1;
    
    // Finally sort by name
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-blue-700 dark:text-blue-300">Available Voices</h3>
        <span className="text-sm text-muted-foreground">{availableVoices.length} voices</span>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search voices..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
        {sortedVoices.map((voice) => {
          const isPremium = voice.id.includes('Studio') || voice.id.includes('Wavenet');
          const isRecommended = voice.id === recommendedVoice;
          
          return (
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
                  
                  {isPremium && (
                    <Badge variant="premium" className="ml-2 bg-gradient-to-r from-amber-500 to-amber-300 text-white dark:from-amber-500 dark:to-amber-400">
                      <Crown className="h-3 w-3 mr-1" /> Premium
                    </Badge>
                  )}
                  
                  {isRecommended && !isPremium && (
                    <Badge variant="outline" className="ml-2 border-green-500 text-green-700 dark:text-green-400">
                      Recommended
                    </Badge>
                  )}
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
          );
        })}
      </div>
    </div>
  );
};

export default VoiceList;
