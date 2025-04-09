
import React from 'react';
import { Message as MessageType } from '@/types/bella';
import FeedbackComponent from './FeedbackComponent';
import EnhancedSpeechSynthesis from './EnhancedSpeechSynthesis';
import { useBella } from '@/context/BellaContext';
import { cn } from '@/lib/utils';

interface MessageWithFeedbackProps {
  message: MessageType;
  showSpeechControls?: boolean;
}

const MessageWithFeedback: React.FC<MessageWithFeedbackProps> = ({
  message,
  showSpeechControls = false
}) => {
  const { ttsOptions, privacySettings, safetyGuardrails } = useBella();
  const isAiMessage = !message.isUser;
  
  // Parse any relevant safety notices from the content
  const hasPrivacyNotice = message.content.includes("*Note: I'm") || 
                           message.content.includes("*Note: I'm using offline mode");
  
  // Helper function to format message content with any privacy notices separately
  const formatMessageContent = () => {
    if (hasPrivacyNotice) {
      const parts = message.content.split('*Note:');
      return (
        <>
          <div>{parts[0].trim()}</div>
          {parts.length > 1 && (
            <div className="mt-2 text-xs italic text-amber-600 dark:text-amber-400">
              *Note: {parts[1].trim()}
            </div>
          )}
        </>
      );
    }
    return message.content;
  };
  
  return (
    <div className={cn(
      "message-container mb-4",
      message.isUser ? "user-message" : "ai-message"
    )}>
      <div 
        className={cn(
          "p-3 rounded-lg max-w-[85%]",
          message.isUser 
            ? "bg-blue-600 text-white ml-auto" 
            : "bg-gray-100 dark:bg-gray-800",
          message.hasBeenReported && "opacity-70"
        )}
      >
        <div className="message-content whitespace-pre-wrap">
          {formatMessageContent()}
        </div>
        
        {/* Show speech synthesis for AI messages */}
        {isAiMessage && showSpeechControls && (
          <div className="mt-2">
            <EnhancedSpeechSynthesis
              text={message.content.split('*Note:')[0].trim()} // Only synthesize the main content, not notices
              options={ttsOptions}
            />
          </div>
        )}
        
        {/* Only show feedback options for AI messages that haven't been reported */}
        {isAiMessage && !message.hasBeenReported && (
          <FeedbackComponent messageId={message.id} />
        )}
        
        {/* Show reported status if applicable */}
        {message.hasBeenReported && (
          <div className="mt-1 text-xs text-red-500 dark:text-red-400">
            This message has been reported and is under review.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageWithFeedback;
