
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const getEyebrowTransform = () => {
    switch (mood) {
      case 'happy':
        return 'translateY(-2px)';
      case 'curious':
        return 'rotate(10deg) translateY(-2px)';
      case 'thinking':
        return 'translateY(-4px) rotate(-5deg)';
      default:
        return 'translateY(0)';
    }
  };

  const getMouthAnimation = () => {
    if (isTalking) {
      return {
        scaleY: [0.6, 1, 0.6],
        transition: {
          repeat: Infinity,
          duration: 0.4,
        }
      };
    }
    
    switch (mood) {
      case 'happy':
        return {
          scale: 1.1,
        };
      case 'curious':
        return {
          scaleX: 0.7,
        };
      case 'thinking':
        return {
          scaleX: 0.6,
          x: 10,
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
        className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-bella-purple to-bella-darkPurple shadow-lg animate-float"
      >
        {/* Face Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Eyes */}
          <div className="flex w-full justify-center space-x-12 mb-4">
            <motion.div 
              className="w-8 h-6 bg-white dark:bg-gray-200 rounded-full overflow-hidden flex justify-center items-center"
              style={{ scaleY: blinking ? 0.1 : 1 }}
            >
              <div className="w-4 h-4 bg-black rounded-full" />
            </motion.div>
            <motion.div 
              className="w-8 h-6 bg-white dark:bg-gray-200 rounded-full overflow-hidden flex justify-center items-center"
              style={{ scaleY: blinking ? 0.1 : 1 }}
            >
              <div className="w-4 h-4 bg-black rounded-full" />
            </motion.div>
          </div>

          {/* Eyebrows */}
          <div className="flex w-full justify-center space-x-12 -mt-8 mb-2">
            <motion.div 
              className="w-8 h-1.5 bg-gray-800 rounded-full"
              style={{ transform: getEyebrowTransform() }}
            />
            <motion.div 
              className="w-8 h-1.5 bg-gray-800 rounded-full"
              style={{ transform: getEyebrowTransform() }}
            />
          </div>
          
          {/* Mouth */}
          <motion.div 
            className="w-16 h-3 bg-gray-800 rounded-full mt-6"
            animate={getMouthAnimation()}
          />
        </div>
      </motion.div>
      
      {/* Activation Ring */}
      {isThinking && (
        <div className="absolute inset-0">
          <div className="absolute inset-0 rounded-full border-4 border-bella-purple opacity-20 animate-pulse-ring"></div>
          <div className="absolute inset-0 rounded-full border-4 border-bella-purple opacity-10 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
        </div>
      )}
      
      {/* Thinking Indicator */}
      {isThinking && (
        <div className="flex space-x-2 mt-4">
          <motion.div 
            className="thinking-dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0 }}
          />
          <motion.div 
            className="thinking-dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
          />
          <motion.div 
            className="thinking-dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
          />
        </div>
      )}
    </div>
  );
};

export default BellaAvatar;
