
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BellaAvatarProps {
  isTalking: boolean;
  isThinking: boolean;
  mood?: 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused';
  phonemes?: Array<{
    phoneme: string;
    startTime: number;
    endTime: number;
  }>;
}

type MouthPosition = 'X' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

const BellaAvatar: React.FC<BellaAvatarProps> = ({ 
  isTalking, 
  isThinking,
  mood = 'neutral',
  phonemes = []
}) => {
  const [blinking, setBlinking] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right' | 'up' | 'down'>('center');
  const [mouthPosition, setMouthPosition] = useState<MouthPosition>('X');
  const [isBreathing, setIsBreathing] = useState(true);
  const avatarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  // Handle natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);
  
  // Handle natural eye movement
  useEffect(() => {
    if (isTalking || isThinking) return; // Don't move eyes during talking or thinking
    
    const eyeMovementInterval = setInterval(() => {
      const directions: ('center' | 'left' | 'right' | 'up' | 'down')[] = ['center', 'left', 'right', 'up', 'down'];
      const weights = [0.6, 0.1, 0.1, 0.1, 0.1]; // Center is more likely
      
      // Weighted random selection
      const random = Math.random();
      let sum = 0;
      let selectedDirection = 'center';
      
      for (let i = 0; i < weights.length; i++) {
        sum += weights[i];
        if (random <= sum) {
          selectedDirection = directions[i];
          break;
        }
      }
      
      setEyeDirection(selectedDirection as 'center' | 'left' | 'right' | 'up' | 'down');
      
      // Return to center after a brief period
      if (selectedDirection !== 'center') {
        setTimeout(() => setEyeDirection('center'), 800);
      }
    }, Math.random() * 6000 + 4000);

    return () => clearInterval(eyeMovementInterval);
  }, [isTalking, isThinking]);

  // Handle phoneme-based lip sync
  useEffect(() => {
    if (!isTalking || phonemes.length === 0) {
      setMouthPosition('X');
      return;
    }

    const startAnimation = () => {
      startTimeRef.current = Date.now();
      animatePhonemes();
    };

    const animatePhonemes = () => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000; // Convert to seconds
      
      // Find the current phoneme based on timing
      const currentPhoneme = phonemes.find(
        p => currentTime >= p.startTime && currentTime <= p.endTime
      );
      
      if (currentPhoneme) {
        setMouthPosition(currentPhoneme.phoneme as MouthPosition);
      } else if (currentTime > phonemes[phonemes.length - 1]?.endTime) {
        // Animation complete
        setMouthPosition('X');
        return;
      } else {
        setMouthPosition('X'); // Default closed mouth
      }
      
      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animatePhonemes);
    };
    
    startAnimation();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setMouthPosition('X');
    };
  }, [isTalking, phonemes]);

  // Fallback lip-sync if no phonemes are provided
  useEffect(() => {
    if (!isTalking || phonemes.length > 0) return;

    const mouthPositions: MouthPosition[] = ['A', 'B', 'C', 'D', 'E', 'F', 'X'];
    let currentIndex = 0;
    
    const lipSyncInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setMouthPosition(mouthPositions[currentIndex]);
      } else {
        const newIndex = Math.floor(Math.random() * mouthPositions.length);
        currentIndex = newIndex;
        setMouthPosition(mouthPositions[newIndex]);
      }
    }, 150);

    return () => {
      clearInterval(lipSyncInterval);
      setMouthPosition('X');
    };
  }, [isTalking, phonemes]);

  // Breathing animation effect
  useEffect(() => {
    if (!isBreathing) return;
    
    const breathingInterval = setInterval(() => {
      const breathIn = () => {
        if (avatarRef.current) {
          avatarRef.current.style.transform = 'scale(1.01)';
          setTimeout(breathOut, 2000);
        }
      };
      
      const breathOut = () => {
        if (avatarRef.current) {
          avatarRef.current.style.transform = 'scale(1)';
        }
      };
      
      breathIn();
    }, 5000);
    
    return () => clearInterval(breathingInterval);
  }, [isBreathing]);

  const getAvatarAnimation = () => {
    if (isTalking) {
      return {
        scale: [1, 1.03, 1],
        y: [0, -2, 0],
        transition: {
          repeat: Infinity,
          duration: 0.8,
        }
      };
    }
    
    switch (mood) {
      case 'happy':
        return {
          scale: 1.03,
          rotate: 1,
          y: -3,
        };
      case 'curious':
        return {
          rotate: 2,
          scale: 1.02,
          translateY: -5,
        };
      case 'thinking':
        return {
          scale: 0.98,
          rotate: -1,
          y: 0,
        };
      case 'surprised':
        return {
          scale: 1.06,
          translateY: -8,
        };
      case 'concerned':
        return {
          scale: 0.97,
          rotate: -2,
        };
      case 'excited':
        return {
          scale: [1.04, 1.02, 1.04],
          rotate: [1, -1, 1],
          transition: {
            repeat: Infinity,
            duration: 1.2,
          }
        };
      case 'confused':
        return {
          rotate: -3,
          scale: 0.98,
          y: 2,
        };
      default:
        return {
          scale: 1,
        };
    }
  };

  const getEyeStyle = () => {
    const baseStyle = { position: 'absolute', width: '22%', height: '12%', borderRadius: '50%', overflow: 'hidden' };
    let leftPos, rightPos;
    
    switch (eyeDirection) {
      case 'left':
        leftPos = { left: '32%', top: '36%' };
        rightPos = { right: '32%', top: '36%' };
        break;
      case 'right':
        leftPos = { left: '34%', top: '36%' };
        rightPos = { right: '30%', top: '36%' };
        break;
      case 'up':
        leftPos = { left: '33%', top: '35%' };
        rightPos = { right: '31%', top: '35%' };
        break;
      case 'down':
        leftPos = { left: '33%', top: '37%' };
        rightPos = { right: '31%', top: '37%' };
        break;
      default: // center
        leftPos = { left: '33%', top: '36%' };
        rightPos = { right: '31%', top: '36%' };
    }
    
    return {
      leftEye: { ...baseStyle, ...leftPos },
      rightEye: { ...baseStyle, ...rightPos }
    };
  };

  const getMouthStyle = () => {
    switch (mouthPosition) {
      case 'A': // Open mouth (ah)
        return { height: '10px', width: '40px', opacity: 0.7, borderRadius: '40%' };
      case 'B': // Slightly open (b/m/p)
        return { height: '5px', width: '30px', opacity: 0.5, borderRadius: '40%' };
      case 'C': // Wide open (ah/oh)
        return { height: '14px', width: '45px', opacity: 0.7, borderRadius: '45%' };
      case 'D': // Rounded (o/oo)
        return { height: '12px', width: '32px', opacity: 0.7, borderRadius: '60%' };
      case 'E': // Smile/ee sound
        return { height: '6px', width: '40px', opacity: 0.6, borderRadius: '20%' };
      case 'F': // Touching teeth (f/v)
        return { height: '8px', width: '36px', opacity: 0.6, borderRadius: '30%' };
      case 'G': // Back of throat (g/k)
        return { height: '7px', width: '30px', opacity: 0.6, borderRadius: '40%' };
      case 'H': // Aspirated (h)
        return { height: '9px', width: '33px', opacity: 0.6, borderRadius: '50%' };
      default: // X - Mouth closed
        return { height: '3px', width: '30px', opacity: 0.4, borderRadius: '40%' };
    }
  };

  const getExpressionOverlay = () => {
    if (blinking) {
      return (
        <div className="absolute inset-0">
          <div className="absolute bg-black/20" style={{ 
            top: '36%', left: '33%', width: '22%', height: '1%', borderRadius: '40%'
          }}></div>
          <div className="absolute bg-black/20" style={{ 
            top: '36%', right: '31%', width: '22%', height: '1%', borderRadius: '40%'
          }}></div>
        </div>
      );
    }
    
    switch (mood) {
      case 'happy':
        return (
          <div className="absolute inset-0">
            <div className="absolute" style={{ 
              bottom: '30%', left: '50%', transform: 'translateX(-50%)', 
              width: '60px', height: '10px', 
              borderBottom: '2px solid rgba(0,0,0,0.15)', 
              borderRadius: '50%' 
            }}></div>
            <div className="absolute bg-amber-500/10" style={{ 
              top: '35%', left: '33%', width: '22%', height: '12%', 
              borderRadius: '50%', border: '1px solid rgba(255,191,0,0.2)' 
            }}></div>
            <div className="absolute bg-amber-500/10" style={{ 
              top: '35%', right: '31%', width: '22%', height: '12%', 
              borderRadius: '50%', border: '1px solid rgba(255,191,0,0.2)' 
            }}></div>
          </div>
        );
        
      case 'surprised':
        return (
          <div className="absolute inset-0">
            <div className="absolute" style={{ 
              top: '36%', left: '33%', width: '22%', height: '14%', 
              border: '1px solid rgba(0,0,0,0.3)', borderRadius: '50%' 
            }}></div>
            <div className="absolute" style={{ 
              top: '36%', right: '31%', width: '22%', height: '14%', 
              border: '1px solid rgba(0,0,0,0.3)', borderRadius: '50%' 
            }}></div>
            <div className="absolute" style={{ 
              bottom: '30%', left: '50%', transform: 'translateX(-50%)', 
              width: '20px', height: '20px', 
              border: '1px solid rgba(0,0,0,0.2)', 
              borderRadius: '50%' 
            }}></div>
          </div>
        );
        
      case 'thinking':
        return (
          <div className="absolute inset-0">
            <div className="absolute bg-black/10" style={{ 
              top: '32%', left: '25%', width: '30%', height: '1%', transform: 'rotate(-8deg)' 
            }}></div>
            <div className="absolute bg-black/5" style={{ 
              bottom: '29%', left: '50%', transform: 'translateX(-50%) rotate(-5deg)', 
              width: '30px', height: '5px', borderRadius: '40%' 
            }}></div>
          </div>
        );
        
      case 'concerned':
        return (
          <div className="absolute inset-0">
            <div className="absolute bg-black/10" style={{ 
              top: '34%', left: '33%', width: '20%', height: '1%', transform: 'rotate(-10deg)' 
            }}></div>
            <div className="absolute bg-black/10" style={{ 
              top: '34%', right: '31%', width: '20%', height: '1%', transform: 'rotate(10deg)' 
            }}></div>
          </div>
        );
        
      case 'confused':
        return (
          <div className="absolute inset-0">
            <div className="absolute bg-black/10" style={{ 
              top: '32%', left: '33%', width: '22%', height: '1%', transform: 'rotate(-15deg)' 
            }}></div>
            <div className="absolute bg-black/10" style={{ 
              top: '38%', right: '31%', width: '22%', height: '1%', transform: 'rotate(5deg)' 
            }}></div>
          </div>
        );
        
      case 'excited':
        return (
          <div className="absolute inset-0">
            <div className="absolute" style={{ 
              top: '34%', left: '33%', width: '22%', height: '14%', 
              border: '1px solid rgba(255,191,0,0.3)', borderRadius: '50%' 
            }}></div>
            <div className="absolute" style={{ 
              top: '34%', right: '31%', width: '22%', height: '14%', 
              border: '1px solid rgba(255,191,0,0.3)', borderRadius: '50%' 
            }}></div>
            <div className="absolute" style={{ 
              bottom: '30%', left: '50%', transform: 'translateX(-50%)', 
              width: '40px', height: '10px', 
              borderBottom: '2px solid rgba(0,0,0,0.2)', 
              borderRadius: '50%' 
            }}></div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const eyeStyles = getEyeStyle();
  const mouthStyle = getMouthStyle();

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div 
        ref={avatarRef}
        className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg"
        animate={getAvatarAnimation()}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-bella-purple/30 shadow-[0_0_30px_rgba(155,135,245,0.5)]">
          <div className="w-full h-full relative">
            <img 
              src="/lovable-uploads/4cce1572-7223-45a3-ae65-c181d13c3b4b.png" 
              alt="Bella AI Assistant" 
              className="w-full h-full object-cover"
            />
            
            {/* Eyes */}
            <AnimatePresence>
              {!blinking && (
                <>
                  <motion.div 
                    className="absolute bg-amber-800/50"
                    style={eyeStyles.leftEye}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                  >
                    <div className="absolute bg-black w-[40%] h-[60%] rounded-full top-[20%] left-[30%]"></div>
                    <div className="absolute bg-amber-500/30 w-full h-1/4 top-0 left-0 opacity-50"></div>
                  </motion.div>
                  
                  <motion.div 
                    className="absolute bg-amber-800/50"
                    style={eyeStyles.rightEye}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                  >
                    <div className="absolute bg-black w-[40%] h-[60%] rounded-full top-[20%] left-[30%]"></div>
                    <div className="absolute bg-amber-500/30 w-full h-1/4 top-0 left-0 opacity-50"></div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            
            {/* Mouth */}
            <motion.div 
              className="absolute"
              style={{ 
                bottom: '28%', 
                left: '50%', 
                transform: 'translateX(-50%)'
              }}
              animate={{ 
                y: isTalking ? [0, 1, 0] : 0
              }}
              transition={{ 
                repeat: isTalking ? Infinity : 0, 
                duration: 0.3
              }}
            >
              <motion.div 
                className="bg-black/60 rounded-md"
                style={mouthStyle}
                initial={{ scale: 0.9 }}
                animate={{ 
                  scale: isTalking ? [1, 1.05, 1] : 1,
                  height: mouthStyle.height,
                  width: mouthStyle.width,
                  opacity: mouthStyle.opacity,
                  borderRadius: mouthStyle.borderRadius
                }}
                transition={{ 
                  repeat: isTalking ? Infinity : 0, 
                  duration: 0.2
                }}
              />
            </motion.div>
            
            {getExpressionOverlay()}
          </div>
        </div>
      </motion.div>
      
      {isThinking && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-20 animate-pulse-ring"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-10 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}
      
      {isThinking && (
        <div className="flex space-x-2 mt-4">
          <motion.div 
            className="w-2 h-2 rounded-full bg-amber-500"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div 
            className="w-2 h-2 rounded-full bg-amber-500"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 rounded-full bg-amber-500"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      )}
    </div>
  );
};

export default BellaAvatar;
