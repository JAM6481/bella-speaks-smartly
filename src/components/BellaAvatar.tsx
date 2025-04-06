import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BellaAvatarProps {
  isTalking: boolean;
  isThinking: boolean;
  mood?: 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned';
}

type MouthPosition = 'X' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

const BellaAvatar: React.FC<BellaAvatarProps> = ({ 
  isTalking, 
  isThinking,
  mood = 'neutral'
}) => {
  const [blinking, setBlinking] = useState(false);
  const [mouthPosition, setMouthPosition] = useState<MouthPosition>('X');
  
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (!isTalking) {
      setMouthPosition('X');
      return;
    }

    const mouthPositions: MouthPosition[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
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
  }, [isTalking]);

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
          rotate: 0.5,
        };
      case 'curious':
        return {
          rotate: 1.5,
          translateY: -5,
        };
      case 'thinking':
        return {
          scale: 0.98,
          rotate: -1,
        };
      case 'surprised':
        return {
          scale: 1.05,
          translateY: -8,
        };
      case 'concerned':
        return {
          scale: 0.97,
          rotate: -2,
        };
      default:
        return {
          scale: 1,
        };
    }
  };

  const renderLipSyncOverlay = () => {
    if (!isTalking || mouthPosition === 'X') return null;
    
    const getMouthStyle = () => {
      switch (mouthPosition) {
        case 'A':
          return { height: '3px', width: '30px', opacity: 0.4 };
        case 'B':
          return { height: '4px', width: '32px', opacity: 0.5 };
        case 'C':
          return { height: '5px', width: '35px', opacity: 0.5 };
        case 'D':
          return { height: '6px', width: '38px', opacity: 0.6 };
        case 'E':
          return { height: '7px', width: '40px', opacity: 0.6 };
        case 'F':
          return { height: '6px', width: '36px', borderRadius: '40%', opacity: 0.5 };
        case 'G':
          return { height: '5px', width: '32px', borderRadius: '50%', opacity: 0.5 };
        case 'H':
          return { height: '3px', width: '28px', opacity: 0.4 };
        default:
          return { height: '0px', width: '0px', opacity: 0 };
      }
    };

    const mouthStyle = getMouthStyle();
    
    return (
      <div className="absolute" style={{ bottom: '32%', left: '50%', transform: 'translateX(-50%)' }}>
        <div 
          className="bg-black rounded-md" 
          style={{
            ...mouthStyle,
            transition: 'all 0.1s ease-in-out',
          }}
        />
      </div>
    );
  };

  const renderExpressionOverlay = () => {
    if (blinking) {
      return (
        <div className="absolute inset-0 bg-black/10 animate-pulse" style={{ 
          clipPath: 'polygon(35% 38%, 48% 38%, 48% 42%, 35% 42%, 35% 38%, 52% 38%, 65% 38%, 65% 42%, 52% 42%, 52% 38%)'
        }}/>
      );
    }
    
    if (mood === 'surprised') {
      return (
        <div className="absolute inset-0">
          <div className="absolute" style={{ top: '36%', left: '35%', width: '13%', height: '6%', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '50%' }}></div>
          <div className="absolute" style={{ top: '36%', left: '52%', width: '13%', height: '6%', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '50%' }}></div>
        </div>
      );
    }
    
    if (mood === 'thinking') {
      return (
        <div className="absolute inset-0">
          <div className="absolute bg-black/10" style={{ top: '34%', left: '40%', width: '20%', height: '1%', transform: 'rotate(-5deg)' }}></div>
        </div>
      );
    }
    
    if (mood === 'concerned') {
      return (
        <div className="absolute inset-0">
          <div className="absolute bg-black/10" style={{ top: '34%', left: '35%', width: '15%', height: '1%', transform: 'rotate(-10deg)' }}></div>
          <div className="absolute bg-black/10" style={{ top: '34%', left: '50%', width: '15%', height: '1%', transform: 'rotate(10deg)' }}></div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div 
        className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg animate-float"
        animate={getAvatarAnimation()}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-bella-purple/30 shadow-[0_0_30px_rgba(155,135,245,0.5)]">
          <div className="w-full h-full relative">
            <img 
              src="/lovable-uploads/4cce1572-7223-45a3-ae65-c181d13c3b4b.png" 
              alt="Bella AI Assistant" 
              className="w-full h-full object-cover"
            />
            {renderExpressionOverlay()}
            {renderLipSyncOverlay()}
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
