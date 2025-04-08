
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from '@/components/ui/popover';
import { FeedbackData } from '@/types/bella';
import { useBella } from '@/context/BellaContext';

interface FeedbackComponentProps {
  messageId: string;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ messageId }) => {
  const { submitFeedback, reportMessage } = useBella();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<'helpful' | 'accuracy' | 'safety' | 'other'>('helpful');
  const [showThankYou, setShowThankYou] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleFeedbackSubmit = () => {
    if (rating !== null) {
      const feedback: FeedbackData = {
        messageId,
        rating,
        comment,
        category,
        timestamp: new Date()
      };
      
      submitFeedback(feedback);
      setShowThankYou(true);
      
      // Reset after a delay
      setTimeout(() => {
        setShowThankYou(false);
        setRating(null);
        setComment('');
      }, 3000);
    }
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      reportMessage(messageId, reportReason);
      setShowReportForm(false);
      setReportReason('');
      // Show a brief thank you message
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }
  };

  return (
    <div className="flex items-center space-x-1 mt-1">
      {showThankYou ? (
        <div className="text-sm text-green-600 dark:text-green-400 animate-fade-in">
          Thank you for your feedback!
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full p-0 w-6 h-6 ${rating === 1 ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : ''}`}
              onClick={() => setRating(1)}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full p-0 w-6 h-6 ${rating === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' : ''}`}
              onClick={() => setRating(0)}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full p-0 w-6 h-6"
                >
                  <Flag className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                {!showReportForm ? (
                  <div className="space-y-4">
                    <h4 className="font-medium">Report this message</h4>
                    <p className="text-sm text-muted-foreground">
                      If this response contains harmful content or personal information, please let us know.
                    </p>
                    <Button 
                      onClick={() => setShowReportForm(true)}
                      className="w-full"
                    >
                      Report content
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Report content</h4>
                      <PopoverClose asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                          <X className="h-4 w-4" />
                        </Button>
                      </PopoverClose>
                    </div>
                    
                    <Textarea
                      placeholder="Please describe why you're reporting this response..."
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowReportForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleReport}
                        disabled={!reportReason.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
          
          {rating !== null && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                >
                  Add details
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Your feedback</h4>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Feedback category:</p>
                    <RadioGroup
                      value={category}
                      onValueChange={(val) => setCategory(val as any)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="helpful" id="helpful" />
                        <Label htmlFor="helpful">Helpfulness</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="accuracy" id="accuracy" />
                        <Label htmlFor="accuracy">Accuracy</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="safety" id="safety" />
                        <Label htmlFor="safety">Safety</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="comment">Additional comments (optional):</Label>
                    <Textarea
                      id="comment"
                      placeholder="What did you like or dislike about this response?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <PopoverClose asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                      <Button size="sm" onClick={handleFeedbackSubmit}>
                        Submit feedback
                      </Button>
                    </PopoverClose>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </>
      )}
    </div>
  );
};

export default FeedbackComponent;
