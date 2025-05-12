
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { CheckCircle, BadgeDollarSign, Star } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export interface PaymentDetailsType {
  amount: number;
  currency?: string;
  reference?: string;
  timestamp?: Date;
  productName?: string;
  productDescription?: string;
}

export interface SellerPaymentFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerName: string;
  buyerAvatar?: string;
  paymentDetails: PaymentDetailsType;
  isNewCustomer?: boolean;
  onViewDetails?: () => void;
  onClose?: () => void;
}

export const SellerPaymentFeedbackModal = ({
  open,
  onOpenChange,
  buyerName,
  buyerAvatar,
  paymentDetails,
  isNewCustomer = false,
  onViewDetails,
  onClose
}: SellerPaymentFeedbackModalProps) => {
  const [animateSuccess, setAnimateSuccess] = useState(true);
  
  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };
  
  const handleClose = () => {
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
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${animateSuccess ? 'animate-bounce-once' : ''}`}
               style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
               onAnimationEnd={() => setAnimateSuccess(false)}>
            <CheckCircle className="text-market-green w-10 h-10" />
          </div>
          
          <DialogTitle className="text-gradient text-2xl font-bold">
            Payment Received!
          </DialogTitle>
          
          <div className="text-market-green font-medium text-lg mb-2">
            {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Payment Details */}
          <div className="bg-secondary/20 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <BadgeDollarSign className="text-market-orange" />
              <h3 className="font-medium">Payment Details</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              {paymentDetails.productName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product:</span>
                  <span className="font-medium">{paymentDetails.productName}</span>
                </div>
              )}
              
              {paymentDetails.reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{paymentDetails.reference}</span>
                </div>
              )}
              
              {paymentDetails.timestamp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {paymentDetails.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Buyer Info */}
          <div className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg">
            <Avatar className="h-12 w-12 border-2 border-background">
              {buyerAvatar ? (
                <AvatarImage src={buyerAvatar} alt={buyerName} />
              ) : (
                <AvatarFallback className="bg-market-blue/20 text-market-blue">
                  {getInitials(buyerName)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{buyerName}</h3>
                {isNewCustomer && (
                  <span className="px-2 py-0.5 bg-market-blue/20 text-market-blue text-xs rounded-full">
                    New Customer
                  </span>
                )}
              </div>
              
              {isNewCustomer && (
                <p className="text-sm text-muted-foreground mt-1">
                  First transaction with you!
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            {onViewDetails && (
              <Button 
                onClick={() => {
                  onViewDetails();
                  handleClose();
                }}
                className="w-full bg-market-green hover:bg-market-green/90"
              >
                View Full Details
              </Button>
            )}
            
            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
