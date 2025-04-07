
import React from 'react';
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
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-blue-500/30 shadow-[0_0_30px_rgba(14,165,233,0.5)]">
          <div className="w-full h-full relative">
            <img 
              src="/lovable-uploads/4cce1572-7223-45a3-ae65-c181d13c3b4b.png" 
              alt="Bella AI Assistant" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Simple indicator for thinking state */}
      {isThinking && (
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <div className="w-2 h-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
};

export default BellaAvatar;
