
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isRecording: boolean;
  isContinuousListening: boolean;
  isExpanded: boolean;
  onToggleContinuousListening: () => void;
  onToggleExpanded: () => void;
  activeModel?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  isRecording,
  isContinuousListening,
  isExpanded,
  onToggleContinuousListening,
  onToggleExpanded,
  activeModel
}) => {
  return (
    <div className="p-3 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-blue-400/20 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
          Chat with Bella
        </div>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs">
          Premium
        </Badge>
        
        {activeModel && (
          <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-xs">
            {activeModel}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {isRecording && (
          <div className="flex items-center text-blue-500">
            <div className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </div>
            <span className="text-xs">Recording</span>
          </div>
        )}
        
        <Button
          type="button"
          size="sm"
          variant={isContinuousListening ? "default" : "outline"}
          onClick={onToggleContinuousListening}
          className={`text-xs px-2 rounded-full ${
            isContinuousListening 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'border-blue-500/50 text-blue-700 hover:text-blue-800'
          }`}
        >
          {isContinuousListening ? "Continuous" : "Auto Detect"}
        </Button>
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onToggleExpanded}
          className="text-xs px-2 text-blue-700 hover:text-blue-800"
        >
          {isExpanded ? "Collapse" : "Expand"}
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
