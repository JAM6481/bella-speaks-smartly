import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SpeechSynthesis from '@/components/SpeechSynthesis';
import { TTSOptions } from '@/utils/ttsService';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // SpeechRecognition setup
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        recognitionRef.current = new SpeechRecognitionClass();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setRecognizedText(transcript);
          
          // If we have a final result in continuous listening mode, send it
          const isFinalResult = event.results[event.results.length - 1].isFinal;
          if (isContinuousListening && isFinalResult && transcript.trim()) {
            // Auto-send message after a short pause to allow for natural breaks
            const finalTranscript = transcript.trim();
            setTimeout(() => {
              onSendMessage(finalTranscript);
              setRecognizedText('');
            }, 1000);
          }
        };
        
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
          toast({
            title: "Voice recognition error",
            description: `Error: ${event.error}. Please try again.`,
            variant: "destructive"
          });
        };
        
        recognitionRef.current.onend = () => {
          // If still recording when recognition ends, restart it
          if (isRecording && !isContinuousListening) {
            const finalText = recognizedText.trim();
            if (finalText) {
              onSendMessage(finalText);
              setRecognizedText('');
            }
            setIsRecording(false);
          } else if (isRecording && isContinuousListening) {
            // Restart for continuous mode
            recognitionRef.current?.start();
          }
        };
      }
    } else {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        if (isRecording) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [isRecording, isContinuousListening]);
  
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
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech recognition not available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    if (!isRecording) {
      setIsRecording(true);
      setRecognizedText('');
      recognitionRef.current.start();
      
      toast({
        title: isContinuousListening ? "Continuous listening mode" : "Listening...",
        description: isContinuousListening 
          ? "Bella will listen and respond continuously. Click again to stop." 
          : "Speak clearly to interact with Bella.",
      });
    } else {
      setIsRecording(false);
      recognitionRef.current.stop();
      
      toast({
        title: "Recording stopped",
        description: "Bella is no longer listening.",
      });
    }
  };

  const toggleContinuousListening = () => {
    // If currently recording, stop first
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    
    setIsContinuousListening(!isContinuousListening);
    
    toast({
      title: !isContinuousListening ? "Continuous mode enabled" : "Continuous mode disabled",
      description: !isContinuousListening 
        ? "Bella will listen and respond continuously when you start recording." 
        : "Bella will wait for you to finish speaking before processing.",
    });
  };

  return (
    <Card className="flex flex-col h-full w-full md:w-96 lg:w-[28rem] bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-bella-purple/40 overflow-hidden">
      <div className="p-3 border-b border-bella-purple/20 bg-gradient-to-r from-bella-purple/20 to-bella-lightPurple/20 flex justify-between items-center">
        <div className="text-xl font-semibold text-bella-deepPurple dark:text-bella-lightPurple">
          Chat with Bella
        </div>
        
        <div className="flex items-center space-x-2">
          {isRecording && (
            <div className="flex items-center text-bella-accent">
              <div className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bella-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-bella-accent"></span>
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
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'border-amber-500/50 text-amber-700 hover:text-amber-800'
            }`}
          >
            {isContinuousListening ? "Continuous" : "Single Mode"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                className={`max-w-[80%] ${
                  message.sender === 'user' ? 'user-message' : 'bella-message'
                }`}
              >
                <p>{message.content}</p>
                
                {message.sender === 'bella' && (
                  <div className="mt-2">
                    <SpeechSynthesis 
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
              <div className="bella-message max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="thinking-dot animate-thinking" />
                  <div className="thinking-dot animate-thinking" style={{ animationDelay: '0.2s' }} />
                  <div className="thinking-dot animate-thinking" style={{ animationDelay: '0.4s' }} />
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
              <div className="user-message max-w-[80%] opacity-70">
                <p>{recognizedText}</p>
                <div className="text-xs text-gray-500 mt-1">Listening...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-bella-purple/20 bg-gradient-to-r from-bella-purple/10 to-bella-lightPurple/10">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "default" : "outline"}
            onClick={toggleRecording}
            className={`rounded-full relative ${
              isRecording 
                ? 'bg-bella-accent text-white border-bella-accent hover:bg-bella-accent/80' 
                : 'text-bella-purple hover:text-bella-deepPurple hover:bg-bella-purple/10'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-bella-accent rounded-full animate-pulse opacity-50"></div>
              </>
            ) : (
              <Mic size={18} />
            )}
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening..." : "Type a message..."}
            className="rounded-full border-bella-purple/30 focus-visible:ring-bella-purple focus-visible:ring-offset-1"
            disabled={isRecording}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isRecording}
            className="rounded-full bg-bella-purple text-white hover:bg-bella-deepPurple"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;
