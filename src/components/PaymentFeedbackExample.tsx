
import { useState } from 'react';
import { PaymentFeedbackModal, FeedbackBonusData } from './PaymentFeedbackModal';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { isFirstTransaction, recordTransaction } from '@/services/paystack';

interface PaymentFeedbackExampleProps {
  userId: string;
  sellerName: string;
  sellerAvatar?: string;
  transactionAmount: number;
}

const PaymentFeedbackExample = ({ 
  userId,
  sellerName, 
  sellerAvatar,
  transactionAmount 
}: PaymentFeedbackExampleProps) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const firstTransaction = isFirstTransaction(userId);
  
  // Example bonus data - in a real app this would come from your backend
  const bonusData: FeedbackBonusData | undefined = firstTransaction ? {
    type: 'cashback',
    amount: 5.00,
    description: 'Welcome bonus for your first transaction!'
  } : undefined;
  
  const handleFeedbackSubmit = (rating: number, comment: string) => {
    // In a real app, you would send this data to your backend
    toast.success(`Thank you for your ${rating}-star feedback!`);
    console.log('Feedback submitted:', { rating, comment });
    
    // Record the transaction
    recordTransaction(userId);
    
    // Close the modal
    setFeedbackModalOpen(false);
  };

  return (
    <div>
      <Button onClick={() => setFeedbackModalOpen(true)}>
        Open Feedback Modal
      </Button>
      
      <PaymentFeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
        isFirstTransaction={firstTransaction}
        transactionAmount={transactionAmount}
        bonus={bonusData}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default PaymentFeedbackExample;
