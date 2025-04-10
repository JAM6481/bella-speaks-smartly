
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { TTSOptions } from '@/utils/ttsService';
import MessageItem from '@/components/chat/MessageItem';
import ThinkingIndicator from '@/components/chat/ThinkingIndicator';
import ChatInput from '@/components/chat/ChatInput';
import ChatHeader from '@/components/chat/ChatHeader';
import { getModelById } from '@/utils/aiProviders';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bella';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isThinking: boolean;
  ttsOptions: TTSOptions;
  activeProvider?: string;
  selectedModel?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  messages,
  isThinking,
  ttsOptions,
  activeProvider,
  selectedModel
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Get model display name for the UI
  const modelInfo = selectedModel ? getModelById(selectedModel) : undefined;
  const activeModelDisplay = modelInfo ? modelInfo.name : activeProvider;
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Auto play the latest message from Bella if it exists
    const latestMessage = messages[messages.length - 1];
    if (latestMessage && latestMessage.sender === 'bella') {
      setActiveMessageId(latestMessage.id);
    }
  }, [messages]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={`flex flex-col ${isExpanded ? 'h-[600px] w-full' : 'h-full w-full md:w-96 lg:w-[28rem]'} bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-blue-500/40 overflow-hidden transition-all duration-300 ease-in-out shadow-xl`}>
      <ChatHeader 
        isRecording={isRecording}
        isContinuousListening={isContinuousListening}
        isExpanded={isExpanded}
        onToggleContinuousListening={() => setIsContinuousListening(!isContinuousListening)}
        onToggleExpanded={toggleExpanded}
        activeModel={activeModelDisplay}
      />
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isActive={message.id === activeMessageId}
              ttsOptions={ttsOptions}
              onSpeechEnd={() => setActiveMessageId(null)}
            />
          ))}
          
          {isThinking && <ThinkingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput 
        onSendMessage={onSendMessage}
        disabled={isThinking}
      />
    </Card>
  );
};

export default ChatInterface;
