
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, SendHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SpeechRecognitionWrapper } from '@/components/SpeechRecognitionWrapper';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const { toast } = useToast();
  
  const { 
    startListening, 
    stopListening, 
    isListening, 
    transcript, 
    resetTranscript, 
    browserSupportsSpeechRecognition 
  } = SpeechRecognitionWrapper({
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

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-blue-400/10">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          disabled={disabled}
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
          disabled={isRecording || disabled}
        />
        
        <Button 
          type="submit" 
          size="icon" 
          disabled={(!input.trim() && !recognizedText.trim()) || disabled}
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <SendHorizontal size={18} />
        </Button>
      </div>
      
      {isRecording && recognizedText && (
        <div className="mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm">
          <div className="flex items-center text-blue-700 dark:text-blue-300">
            <div className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <span className="truncate">{recognizedText}</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default ChatInput;
