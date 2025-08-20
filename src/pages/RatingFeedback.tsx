import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Seller } from '@/types';
import { toast } from 'sonner';
import { formatDuration, getInitials } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CallParticipant } from '@/contexts/live-call-context';
import Loader from '@/components/ui/loader';
import { useAxios } from '@/lib/axiosUtils';
import { useSubmitFeedback } from '@/hooks/api-hooks';

const axiosUtil = useAxios()

const RatingFeedback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const { userRole } = useAuth();
  const { seller, callDuration } = location.state as { seller: CallParticipant, callDuration: number };

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const feedbackMutation = useSubmitFeedback()

  useEffect(() => {
    if (!seller || !callDuration) {
      toast.error("Invalid feedback session. Redirecting...");
      navigate(-1);
    } else {
      setIsChecking(false);
    }
  }, [seller, callDuration, navigate, userRole]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating star");
      return;
    }

    await feedbackMutation.mutateAsync({
      p_seller_id: seller.id,
      p_rating: rating,
      p_feedback_text: feedback,
      p_call_duration: callDuration.toString()
    })
    navigate(-1);
  };

  const handleSkip = () => {
    toast.info("Rating skipped");
    navigate(-1);
  };

  if (isChecking) {
    return <Loader />;
  }

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <div className="glass-morphism rounded-xl p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-2xl font-bold text-gradient mb-2">How was your call?</h1>
          <p className="text-muted-foreground">Rate your experience with {seller.name}</p>

          <Avatar className="h-20 w-20 my-6 border-2 border-secondary">
            <AvatarFallback className="bg-secondary text-foreground text-2xl">
              {getInitials(seller.name)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-lg font-medium">{seller.name}</h2>
          <div className="text-xs text-market-blue">Call duration: {formatDuration(callDuration)}</div>
        </div>

        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              type='button'
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
            disabled={feedbackMutation.isPending}
            onClick={handleSubmit}
            className="w-full bg-market-orange hover:bg-market-orange/90 disabled:cursor-not-allowed"
          >
            {feedbackMutation.isPending ? 'Submitting...' : 'Submit Rating'}
          </Button>
          <Button
            type='button'
            disabled={feedbackMutation.isPending}
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground disabled:cursor-not-allowed"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingFeedback;
