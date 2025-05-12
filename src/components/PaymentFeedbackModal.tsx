
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Award, Gift, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { usePatchPaystackIframeDialog } from '@/hooks/usePatchPaystackIframeDialog';

export interface FeedbackBonusData {
  type: 'cashback' | 'discount' | 'points' | 'credit';
  amount: number;
  description: string;
}

export interface PaymentFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  sellerAvatar?: string;
  isFirstTransaction?: boolean;
  transactionAmount?: number;
  bonus?: FeedbackBonusData;
  onFeedbackSubmit: (rating: number, comment: string) => void;
  onClose?: () => void;
}

export const PaymentFeedbackModal = ({
  open,
  onOpenChange,
  sellerName,
  sellerAvatar,
  isFirstTransaction = false,
  transactionAmount = 0,
  bonus,
  onFeedbackSubmit,
  onClose
}: PaymentFeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  // Use the hook to fix Paystack iframe issues if needed
  usePatchPaystackIframeDialog();
  
  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    onFeedbackSubmit(rating, feedback);
    
    // Reset the form
    setRating(0);
    setFeedback('');
    
    // Close the modal if not explicitly handled by parent
    if (!onClose) {
      onOpenChange(false);
    }
  };
  
  const handleClose = () => {
    // Reset form state
    setRating(0);
    setFeedback('');
    
    // Call onClose if provided
    if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto glass-morphism">
        <DialogHeader className="flex flex-col items-center text-center">
          {isFirstTransaction ? (
            <div className="flex flex-col items-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-market-orange/20 flex items-center justify-center mb-2">
                  <Award className="w-12 h-12 text-market-orange" />
                </div>
                <div className="absolute -top-2 -right-2 bg-market-green text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  First!
                </div>
              </div>
              <DialogTitle className="text-gradient text-2xl font-bold mt-2">
                Congratulations!
              </DialogTitle>
              <p className="text-market-green font-medium mt-1">
                You completed your first transaction!
              </p>
            </div>
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
              <CheckCircle className="text-market-green w-8 h-8" />
            </div>
          )}
          
          <div className="mb-4">
            <DialogTitle className={`${!isFirstTransaction ? "text-gradient" : ""} text-xl font-semibold mb-2`}>
              {isFirstTransaction ? "How was your experience?" : "Transaction Complete"}
            </DialogTitle>
            
            <p className="text-muted-foreground">
              Your payment to {sellerName} was successful.
              {transactionAmount > 0 && (
                <span className="block font-medium mt-1">
                  Amount: ${transactionAmount.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </DialogHeader>
        
        {/* Bonus section - only shown when bonus data is provided */}
        {bonus && (
          <div className="bg-market-orange/10 p-4 rounded-lg mb-4 animate-fade-in">
            <div className="flex items-start">
              <Gift className="text-market-orange mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-market-orange">You've earned a bonus!</h3>
                <p className="text-sm mt-1">{bonus.description}</p>
                <div className="mt-2 font-bold">
                  {bonus.type === 'cashback' && `$${bonus.amount.toFixed(2)} Cashback`}
                  {bonus.type === 'discount' && `${bonus.amount}% Discount on next purchase`}
                  {bonus.type === 'points' && `${bonus.amount} Reward Points`}
                  {bonus.type === 'credit' && `$${bonus.amount.toFixed(2)} Platform Credit`}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rate your experience with {sellerName}
            </label>
            <div className="flex justify-center py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="mx-1 transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    fill={rating >= star ? "#F97316" : "transparent"}
                    stroke={rating >= star ? "#F97316" : "#888"}
                  />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Additional comments (optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              className="bg-secondary/50 border-none resize-none h-24"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleSubmit}
              className="w-full bg-market-green hover:bg-market-green/90"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
