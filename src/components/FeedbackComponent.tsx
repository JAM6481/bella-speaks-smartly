
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useBella } from '@/context/BellaContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface FeedbackComponentProps {
  messageId: string;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({ messageId }) => {
  const { submitFeedback, reportMessage } = useBella();
  const [feedbackType, setFeedbackType] = useState<'helpful' | 'unhelpful' | null>(null);
  const [comment, setComment] = useState('');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const handleFeedback = (type: 'helpful' | 'unhelpful') => {
    setFeedbackType(type);
    submitFeedback({
      messageId,
      rating: type === 'helpful' ? 1 : -1,
      comment,
      timestamp: new Date(),
      // Convert 'unhelpful' to 'accuracy' to match the expected type
      category: type === 'helpful' ? 'helpful' : 'accuracy'
    });
    setIsPopoverOpen(false);
  };
  
  const handleReport = () => {
    reportMessage(messageId, reportReason);
    setIsReportDialogOpen(false);
    setReportReason('');
  };
  
  return (
    <div className="flex items-center mt-2 space-x-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${feedbackType === 'helpful' ? 'text-green-500' : ''}`}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-60">
          <div className="space-y-2">
            <p className="text-sm font-medium">Was this response helpful?</p>
            <div className="flex justify-between">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback('helpful')}
                className={feedbackType === 'helpful' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400' : ''}
              >
                Yes, helpful
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback('unhelpful')}
                className={feedbackType === 'unhelpful' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400' : ''}
              >
                Not helpful
              </Button>
            </div>
            
            <Textarea 
              placeholder="Additional comments (optional)" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 text-sm"
              rows={2}
            />
          </div>
        </PopoverContent>
      </Popover>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className={`h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ${feedbackType === 'unhelpful' ? 'text-red-500' : ''}`}
        onClick={() => handleFeedback('unhelpful')}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        onClick={() => setIsReportDialogOpen(true)}
      >
        <Flag className="h-4 w-4" />
      </Button>
      
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>
              Please explain why you're reporting this message. This helps us improve Bella.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea 
            placeholder="Reason for reporting this message" 
            value={reportReason} 
            onChange={(e) => setReportReason(e.target.value)}
            className="mt-2"
            rows={4}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReport}
              disabled={!reportReason.trim()}
            >
              Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackComponent;
