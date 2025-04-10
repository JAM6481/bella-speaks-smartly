
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import EnhancedSpeechSynthesis from '@/components/EnhancedSpeechSynthesis';
import { TTSOptions } from '@/utils/ttsService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bella';
  timestamp: Date;
}

interface MessageItemProps {
  message: Message;
  isActive: boolean;
  ttsOptions: TTSOptions;
  onSpeechEnd: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  isActive, 
  ttsOptions, 
  onSpeechEnd 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-[85%] ${
          message.sender === 'user' ? 'user-message' : 'bella-message'
        }`}
      >
        {message.sender === 'bella' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center mb-2"
          >
            <div className="w-6 h-6 rounded-full flex-shrink-0 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white" />
            </div>
            <span className="ml-2 text-sm font-medium text-blue-700 dark:text-blue-300">Bella</span>
          </motion.div>
        )}
        
        <p className="text-sm">{message.content}</p>
        
        {message.sender === 'bella' && (
          <div className="mt-2">
            <EnhancedSpeechSynthesis 
              text={message.content}
              autoPlay={isActive}
              options={ttsOptions}
              onEnd={onSpeechEnd}
            />
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageItem;
