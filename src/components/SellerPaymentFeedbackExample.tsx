
import { useState } from 'react';
import { SellerPaymentFeedbackModal, PaymentDetailsType } from './SellerPaymentFeedbackModal';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { isFirstTransaction } from '@/services/paystack';

interface SellerPaymentFeedbackExampleProps {
  buyerId: string;
  buyerName: string;
  buyerAvatar?: string;
  paymentDetails: PaymentDetailsType;
}

const SellerPaymentFeedbackExample = ({
  buyerId,
  buyerName,
  buyerAvatar,
  paymentDetails
}: SellerPaymentFeedbackExampleProps) => {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const isNewCustomer = isFirstTransaction(buyerId);
  
  const handleViewDetails = () => {
    // In a real app, this would navigate to a page with detailed transaction info
    toast.info("Navigating to transaction details page");
    console.log("View transaction details for:", paymentDetails.reference);
  };

  return (
    <div>
      <Button onClick={() => setFeedbackModalOpen(true)}>
        Simulate Payment Received
      </Button>
      
      <SellerPaymentFeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        buyerName={buyerName}
        buyerAvatar={buyerAvatar}
        paymentDetails={paymentDetails}
        isNewCustomer={isNewCustomer}
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default SellerPaymentFeedbackExample;
