
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  lang?: string;
}

export const SpeechRecognitionWrapper = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);

  // Initialize speech recognition on component mount
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      const recognitionInstance = new SpeechRecognitionAPI();
      recognitionInstance.continuous = options.continuous ?? true;
      recognitionInstance.interimResults = options.interimResults ?? true;
      recognitionInstance.lang = options.lang ?? 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (options.onResult) {
          options.onResult(transcript);
        }
        
        // If this is a final result and we have a callback for final results
        if (event.results[current].isFinal && options.onFinalResult) {
          options.onFinalResult(transcript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        // Only restart if we're still in listening mode
        if (isListening && options.continuous) {
          recognitionInstance.start();
        } else {
          setIsListening(false);
        }
      };
      
      setRecognition(recognitionInstance);
      setBrowserSupportsSpeechRecognition(true);
    }
    
    return () => {
      if (recognition) {
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        if (isListening) {
          recognition.stop();
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      setIsListening(false);
      recognition.stop();
    }
  }, [recognition]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  };
};
