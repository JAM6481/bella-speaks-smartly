
import React from 'react';
import { Message as MessageType } from '@/types/bella';
import FeedbackComponent from './FeedbackComponent';
import SpeechSynthesis from './SpeechSynthesis';
import EnhancedSpeechSynthesis from './EnhancedSpeechSynthesis';
import { useBella } from '@/context/BellaContext';

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
  
  return (
    <div className={`message-container ${message.isUser ? 'user-message' : 'ai-message'}`}>
      <div 
        className={`p-3 rounded-lg ${
          message.isUser ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 dark:bg-gray-800'
        } ${message.hasBeenReported ? 'opacity-70' : ''}`}
      >
        {message.content}
        
        {/* Show speech synthesis for AI messages */}
        {isAiMessage && showSpeechControls && (
          <div className="mt-2">
            <EnhancedSpeechSynthesis
              text={message.content}
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
