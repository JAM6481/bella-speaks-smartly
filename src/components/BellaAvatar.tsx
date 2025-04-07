
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface BellaAvatarProps {
  isTalking: boolean;
  isThinking: boolean;
  mood?: 'happy' | 'curious' | 'thinking' | 'neutral' | 'surprised' | 'concerned' | 'excited' | 'confused';
}

const BellaAvatar: React.FC<BellaAvatarProps> = ({ 
  isTalking, 
  isThinking,
  mood = 'neutral'
}) => {
  const [pulseSize, setPulseSize] = useState(1);
  
  // Dynamic animation based on talking/thinking state
  useEffect(() => {
    const interval = setInterval(() => {
      if (isTalking || isThinking) {
        setPulseSize(prev => (prev === 1 ? 1.05 : 1));
      } else {
        setPulseSize(1);
      }
    }, isTalking ? 300 : 800);
    
    return () => clearInterval(interval);
  }, [isTalking, isThinking]);

  // Get the right animation and style based on mood
  const getMoodStyles = () => {
    switch(mood) {
      case 'happy':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.6)]';
      case 'thinking':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.4)]';
      case 'curious':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.5)]';
      case 'surprised':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.7)]';
      case 'concerned':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.3)]';
      case 'excited':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.8)]';
      case 'confused':
        return 'shadow-[0_0_30px_rgba(14,165,233,0.4)]';
      default:
        return 'shadow-[0_0_30px_rgba(14,165,233,0.5)]';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <AnimatePresence>
        {isThinking && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-14 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full z-10"
          >
            <div className="flex space-x-3">
              <motion.div 
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden ${getMoodStyles()}`}
        animate={{ 
          scale: pulseSize,
        }}
        transition={{ 
          duration: isTalking ? 0.3 : 0.8,
          ease: "easeInOut"
        }}
      >
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-500/30">
          <div className="w-full h-full relative bg-gradient-to-b from-blue-400/20 to-blue-600/20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10"
              animate={{
                opacity: [0.5, 0.7, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <img 
              src="/lovable-uploads/4cce1572-7223-45a3-ae65-c181d13c3b4b.png" 
              alt="Bella AI Assistant" 
              className="w-full h-full object-cover"
            />
            
            {isTalking && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-500/40 to-transparent"
                animate={{
                  height: ["12%", "15%", "12%"],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Enhanced pulse effect when active */}
      {(isTalking || isThinking) && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-500/40"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* Live indicator */}
      <motion.div 
        className="absolute top-2 right-2 md:top-4 md:right-4 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7] 
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

export default BellaAvatar;
