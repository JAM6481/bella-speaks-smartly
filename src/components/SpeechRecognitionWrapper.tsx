
import { useState, useEffect, useCallback } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  lang?: string;
  autoStopTimeout?: number; // Time in ms to automatically stop after silence
}

export const SpeechRecognitionWrapper = (options: SpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const [lastSpeechTime, setLastSpeechTime] = useState<number>(0);
  const [autoStopTimeoutId, setAutoStopTimeoutId] = useState<NodeJS.Timeout | null>(null);
  
  const autoStopDuration = options.autoStopTimeout || 1500; // Default to 1.5 seconds of silence

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
        setLastSpeechTime(Date.now());
        
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
      
      // Add an onspeechend event handler to detect when user stops speaking
      recognitionInstance.onspeechend = () => {
        setLastSpeechTime(Date.now());
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
      
      // Clear any existing auto-stop timeout
      if (autoStopTimeoutId) {
        clearTimeout(autoStopTimeoutId);
      }
    };
  }, []);

  // Handle auto-stopping after silence
  useEffect(() => {
    if (isListening && lastSpeechTime > 0) {
      // Clear any existing timeout
      if (autoStopTimeoutId) {
        clearTimeout(autoStopTimeoutId);
      }
      
      // Set a new timeout to check for silence
      const timeoutId = setTimeout(() => {
        const silenceDuration = Date.now() - lastSpeechTime;
        
        // If there's been silence for the auto-stop duration, stop listening
        if (silenceDuration >= autoStopDuration) {
          stopListening();
          
          // If we have transcript and a final result callback, trigger it
          if (transcript && options.onFinalResult) {
            options.onFinalResult(transcript);
          }
        }
      }, autoStopDuration);
      
      setAutoStopTimeoutId(timeoutId);
    }
    
    return () => {
      if (autoStopTimeoutId) {
        clearTimeout(autoStopTimeoutId);
      }
    };
  }, [isListening, lastSpeechTime, transcript]);

  const startListening = useCallback(() => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      setLastSpeechTime(Date.now());
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      setIsListening(false);
      recognition.stop();
    }
    
    // Clear any existing auto-stop timeout
    if (autoStopTimeoutId) {
      clearTimeout(autoStopTimeoutId);
      setAutoStopTimeoutId(null);
    }
  }, [recognition, autoStopTimeoutId]);

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
