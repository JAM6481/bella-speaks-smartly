
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
  // Simplified component without animations
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-lg">
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-bella-purple/30 shadow-[0_0_30px_rgba(155,135,245,0.5)]">
          <div className="w-full h-full relative">
            <img 
              src="/lovable-uploads/4cce1572-7223-45a3-ae65-c181d13c3b4b.png" 
              alt="Bella AI Assistant" 
              className="w-full h-full object-cover"
            />
            
            {/* Static Eyes */}
            <div 
              className="absolute bg-amber-800/50"
              style={{ 
                left: '33%', 
                top: '36%', 
                width: '22%', 
                height: '12%', 
                borderRadius: '50%', 
                overflow: 'hidden' 
              }}
            >
              <div className="absolute bg-black w-[40%] h-[60%] rounded-full top-[20%] left-[30%]"></div>
              <div className="absolute bg-amber-500/30 w-full h-1/4 top-0 left-0 opacity-50"></div>
            </div>
            
            <div 
              className="absolute bg-amber-800/50"
              style={{ 
                right: '31%', 
                top: '36%', 
                width: '22%', 
                height: '12%', 
                borderRadius: '50%', 
                overflow: 'hidden' 
              }}
            >
              <div className="absolute bg-black w-[40%] h-[60%] rounded-full top-[20%] left-[30%]"></div>
              <div className="absolute bg-amber-500/30 w-full h-1/4 top-0 left-0 opacity-50"></div>
            </div>
            
            {/* Static Mouth */}
            <div 
              className="absolute"
              style={{ 
                bottom: '28%', 
                left: '50%', 
                transform: 'translateX(-50%)'
              }}
            >
              <div 
                className="bg-black/60 rounded-md"
                style={{ 
                  height: '3px', 
                  width: '30px', 
                  opacity: 0.4, 
                  borderRadius: '40%' 
                }}
              />
            </div>
            
            {/* Simple expression overlays based on mood */}
            {mood === 'happy' && (
              <div className="absolute inset-0">
                <div className="absolute" style={{ 
                  bottom: '30%', left: '50%', transform: 'translateX(-50%)', 
                  width: '60px', height: '10px', 
                  borderBottom: '2px solid rgba(0,0,0,0.15)', 
                  borderRadius: '50%' 
                }}></div>
              </div>
            )}
            
            {mood === 'thinking' && (
              <div className="absolute inset-0">
                <div className="absolute bg-black/10" style={{ 
                  top: '32%', left: '25%', width: '30%', height: '1%', transform: 'rotate(-8deg)' 
                }}></div>
              </div>
            )}
            
            {mood === 'concerned' && (
              <div className="absolute inset-0">
                <div className="absolute bg-black/10" style={{ 
                  top: '34%', left: '33%', width: '20%', height: '1%', transform: 'rotate(-10deg)' 
                }}></div>
                <div className="absolute bg-black/10" style={{ 
                  top: '34%', right: '31%', width: '20%', height: '1%', transform: 'rotate(10deg)' 
                }}></div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Simple indicator for thinking state */}
      {isThinking && (
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
      )}
    </div>
  );
};

export default BellaAvatar;
