
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, SendHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

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
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  messages,
  isThinking 
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const toggleRecording = () => {
    // In a real implementation, this would connect to the DeepSpeech API
    if (!isRecording) {
      setIsRecording(true);
      toast({
        title: "Listening...",
        description: "Speak clearly to interact with Bella.",
      });
      
      // Simulating a voice recording - in a real app, this would use WebSpeech API or similar
      setTimeout(() => {
        setIsRecording(false);
        // Simulate getting text from speech
        onSendMessage("What's the weather today?");
        toast({
          title: "Voice captured",
          description: "Your voice command has been processed.",
        });
      }, 3000);
    } else {
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Bella is no longer listening.",
      });
    }
  };

  return (
    <Card className="flex flex-col h-full w-full md:w-96 lg:w-[28rem] bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm rounded-lg border border-bella-purple/40 overflow-hidden">
      <div className="p-3 border-b border-bella-purple/20 bg-gradient-to-r from-bella-purple/20 to-bella-lightPurple/20 flex justify-between items-center">
        <div className="text-xl font-semibold text-bella-deepPurple dark:text-bella-lightPurple">
          Chat with Bella
        </div>
        {isRecording && (
          <div className="flex items-center text-bella-accent animate-pulse">
            <span className="mr-2 text-sm">Recording</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bella-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-bella-accent"></span>
            </span>
          </div>
        )}
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
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-bella-purple/20 bg-gradient-to-r from-bella-purple/10 to-bella-lightPurple/10">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={toggleRecording}
            className={`rounded-full ${isRecording ? 'bg-bella-accent text-white border-bella-accent hover:bg-bella-accent/80' : 'text-bella-purple hover:text-bella-deepPurple hover:bg-bella-purple/10'}`}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
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
