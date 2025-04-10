
import React from 'react';
import { motion } from 'framer-motion';

const ThinkingIndicator: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bella-message max-w-[85%] py-4">
        <div className="flex space-x-2">
          <motion.div 
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
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
      </div>
    </motion.div>
  );
};

export default ThinkingIndicator;
