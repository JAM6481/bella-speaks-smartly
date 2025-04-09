import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import EnhancedSpeechSynthesis from '@/components/EnhancedSpeechSynthesis';
import { TTSOptions } from '@/utils/ttsService';
import { Badge } from '@/components/ui/badge';
import { SpeechRecognitionWrapper } from '@/components/SpeechRecognitionWrapper';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  messages,
  isThinking,
  ttsOptions
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { startListening, stopListening, isListening, transcript, resetTranscript, browserSupportsSpeechRecognition } = 
    SpeechRecognitionWrapper({
      continuous: true,
      onResult: (text) => setRecognizedText(text),
      onFinalResult: (text) => {
        if (text.trim()) {
          onSendMessage(text.trim());
          resetTranscript();
          if (!isContinuousListening) {
            setIsRecording(false);
          }
        }
      },
      autoStopTimeout: 2000 // Auto-stop after 2 seconds of silence
    });
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    } else if (recognizedText.trim()) {
      onSendMessage(recognizedText.trim());
      resetTranscript();
    }
  };

  const toggleRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isRecording) {
      setIsRecording(true);
      resetTranscript();
      startListening();
      
      toast({
        title: isContinuousListening ? "Continuous listening mode" : "Listening...",
        description: isContinuousListening 
          ? "Bella will listen and respond continuously. Click again to stop." 
          : "Speak clearly and pause when done - Bella will automatically detect when you finish speaking.",
      });
    } else {
      setIsRecording(false);
      stopListening();
      
      // In non-continuous mode, send the final transcript
      if (!isContinuousListening && recognizedText.trim()) {
        onSendMessage(recognizedText.trim());
        resetTranscript();
      }
      
      toast({
        title: "Recording stopped",
        description: "Bella is no longer listening.",
      });
    }
  };

  const toggleContinuousListening = () => {
    // If currently recording, stop first
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    }
    
    setIsContinuousListening(!isContinuousListening);
    
    toast({
      title: !isContinuousListening ? "Continuous mode enabled" : "Continuous mode disabled",
      description: !isContinuousListening 
        ? "Bella will listen and respond continuously when you start recording." 
        : "Bella will automatically detect when you finish speaking before processing.",
    });
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Quick action suggestions
  const suggestions = [
    "What can you help me with?",
    "Tell me a joke",
    "What's the weather today?",
    "Set a reminder for later"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  return (
    <Card className={`flex flex-col ${isExpanded ? 'h-[600px] w-full' : 'h-full w-full md:w-96 lg:w-[28rem]'} bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-blue-500/40 overflow-hidden transition-all duration-300 ease-in-out shadow-xl`}>
      <div className="p-3 border-b border-blue-500/20 bg-gradient-to-r from-blue-600/20 to-blue-400/20 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
            Chat with Bella
          </div>
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs">
            Premium
          </Badge>
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
            onClick={toggleContinuousListening}
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
            onClick={toggleExpanded}
            className="text-xs px-2 text-blue-700 hover:text-blue-800"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
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
                      autoPlay={message.id === activeMessageId}
                      options={ttsOptions}
                      onEnd={() => setActiveMessageId(null)}
                    />
                  </div>
                )}
                
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bella-message max-w-[85%] py-4">
                <div className="flex space-x-2">
                  <motion.div 
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-3 h-3 bg-blue-500 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          {isRecording && recognizedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <div className="user-message max-w-[85%] opacity-70">
                <p className="text-sm">{recognizedText}</p>
                <div className="text-xs text-gray-500 mt-1 flex items-center">
                  <div className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </div>
                  Listening...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-blue-400/10">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "default" : "outline"}
            onClick={toggleRecording}
            className={`rounded-full relative ${
              isRecording 
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-500/10'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-pulse opacity-50"></div>
              </>
            ) : (
              <Mic size={18} />
            )}
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type a message..."}
            className="rounded-full border-blue-500/30 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ai-input"
            disabled={isRecording}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() && !recognizedText.trim()}
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;
