
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Seller } from '@/types';
import { toast } from 'sonner';
import { formatDuration, getInitials } from '@/lib/utils';

const RatingFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { seller, callDuration } = location.state as { seller: Seller, callDuration: number };
  
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');


  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    // In a real app, this would submit the rating to the API
    toast.success(`Thank you! Your ${rating}-star rating has been submitted.`);
    navigate('/markets');
  };

  const handleSkip = () => {
    toast.info("Rating skipped");
    navigate('/markets');
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <div className="glass-morphism rounded-xl p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl font-bold text-gradient mb-2">How was your call?</h1>
          <p className="text-muted-foreground">Rate your experience with {seller.name}</p>
          
          <Avatar className="h-20 w-20 my-6 border-2 border-secondary">
            {seller.avatar ? (
              <AvatarImage src={seller.avatar} alt={seller.name} />
            ) : (
              <AvatarFallback className="bg-secondary text-foreground text-2xl">
                {getInitials(seller.name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <h2 className="text-lg font-medium">{seller.name}</h2>
          <p className="text-sm text-muted-foreground mb-2">{seller.description}</p>
          <div className="text-xs text-market-blue">Call duration: {formatDuration(callDuration)}</div>
        </div>
        
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="mx-1 transition-transform hover:scale-110"
            >
              <Star
                size={32}
                fill={rating >= star ? "#F97316" : "transparent"}
                color={rating >= star ? "#F97316" : "#888"}
              />
            </button>
          ))}
        </div>
        
        <div className="mb-6">
          <label className="text-sm text-muted-foreground block mb-2">
            Additional feedback (optional)
          </label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience..."
            className="bg-secondary/50 border-none resize-none"
            rows={3}
          />
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-market-orange hover:bg-market-orange/90"
          >
            Submit Rating
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingFeedback;
