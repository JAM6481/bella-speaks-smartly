
import React from 'react';
import { motion } from 'framer-motion';

interface PlaybackIndicatorProps {
  isPlaying: boolean;
  text: string;
}

const PlaybackIndicator: React.FC<PlaybackIndicatorProps> = ({ isPlaying, text }) => {
  const getWordCount = () => {
    return (text || '').split(/\s+/).filter(Boolean).length;
  };
  
  // Create a varying number of bars based on word count, with a min of 3 and max of 8
  const barCount = Math.min(8, Math.max(3, Math.floor(getWordCount() / 10)));
  
  return (
    <div className="flex items-center gap-1 h-2 mb-1">
      {isPlaying && Array.from({ length: barCount }).map((_, i) => (
        <motion.div 
          key={i}
          className="bg-blue-500 w-0.5 rounded"
          initial={{ height: 4 }}
          animate={{ 
            height: [4, 12, 4],
            transition: { 
              repeat: Infinity, 
              duration: 1, 
              delay: i * 0.1,
              repeatType: 'reverse' 
            }
          }}
        />
      ))}
    </div>
  );
};

export default PlaybackIndicator;
