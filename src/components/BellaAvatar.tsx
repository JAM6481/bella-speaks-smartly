
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BellaAvatarProps {
  isTalking: boolean;
  isThinking: boolean;
  mood?: 'happy' | 'curious' | 'thinking' | 'neutral';
}

const BellaAvatar: React.FC<BellaAvatarProps> = ({ 
  isTalking, 
  isThinking,
  mood = 'neutral'
}) => {
  const [blinking, setBlinking] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // The realistic avatar doesn't have the same mouth and eyebrow animations
  // Instead, we'll use subtle lighting and scaling effects based on mood and talking state
  
  const getAvatarAnimation = () => {
    if (isTalking) {
      return {
        scale: [1, 1.02, 1],
        transition: {
          repeat: Infinity,
          duration: 0.4,
        }
      };
    }
    
    switch (mood) {
      case 'happy':
        return {
          scale: 1.02,
        };
      case 'curious':
        return {
          rotate: 1,
        };
      case 'thinking':
        return {
          scale: 0.98,
        };
      default:
        return {
          scale: 1,
        };
    }
  };
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div 
        className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg animate-float"
        animate={getAvatarAnimation()}
      >
        {/* Realistic Avatar */}
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-bella-purple/30 shadow-[0_0_30px_rgba(155,135,245,0.5)]">
          {/* This would be replaced with an actual image in a real implementation */}
          {/* Using a gradient as a placeholder for the realistic avatar */}
          <div className="w-full h-full bg-gradient-to-b from-[#f5e1d5] via-[#e6c8b4] to-[#d4b3a1] relative">
            {/* Eyes - only shown during blink animation */}
            {blinking && (
              <div className="absolute top-1/3 w-full flex justify-center space-x-16">
                <div className="w-8 h-1 bg-black rounded-full"></div>
                <div className="w-8 h-1 bg-black rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Activation Ring */}
      {isThinking && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-20 animate-pulse-ring"></div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 opacity-10 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}
      
      {/* Thinking Indicator */}
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
