import { useState, useEffect, useRef } from 'react';
import { usePaystack } from '@/contexts/paystack-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

type PaystackModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  email: string;
  publicKey: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  metadata?: Record<string, any>;
  reference?: string;
  currency?: string;
  channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'>;
};

export const PaystackModal = ({
  open,
  onOpenChange,
  amount,
  email,
  publicKey,
  onSuccess,
  onClose,
  metadata,
  reference,
  currency = 'NGN',
  channels = ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
}: PaystackModalProps) => {
  const { initializePayment, isInitializing, paymentError, resetPayment, paystackLoaded } = usePaystack();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [containerId] = useState(`paystack-embed-container-${Date.now()}`);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle body styles when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Reset payment state when modal closes
  useEffect(() => {
    if (!open) {
      setPaymentStatus('idle');
      resetPayment();
    }
  }, [open, resetPayment]);

  const handlePayment = () => {
    setPaymentStatus('processing');
    
    // Add a small delay to ensure the container is ready
      initializePayment({
        publicKey,
        email,
        amount,
        currency,
        reference,
        channels,
        metadata,
        // container: containerId, // Make sure this ID is passed correctly
        onSuccess: (response) => {
          setPaymentStatus('success');
          onSuccess(response);
          setTimeout(() => onOpenChange(false), 2000);
        },
        onClose: () => {
          setPaymentStatus('idle');
          onClose?.();
        },
      });
  };

  const renderContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-semibold">Payment Successful</h3>
            <p className="text-muted-foreground text-center">
              Your payment has been processed successfully.
            </p>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <XCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-xl font-semibold">Payment Failed</h3>
            <p className="text-muted-foreground text-center">
              {paymentError || 'Payment could not be completed. Please try again.'}
            </p>
            <Button type="button" onClick={() => setPaymentStatus('idle')}>Try Again</Button>
          </div>
        );
      case 'processing':
        return;
        return (
          <div className="flex flex-col items-center w-full py-8">
            {/* Container for Paystack iframe with improved styling */}
            <div 
              id={containerId}
              ref={containerRef}
              className="w-full min-h-[400px] relative"
              style={{
                zIndex: 9999,
                pointerEvents: 'auto',
                touchAction: 'auto'
              }}
            />
            {!paystackLoaded && (
              <div className="flex flex-col items-center justify-center space-y-2 pt-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="text-muted-foreground">Loading payment gateway...</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Payment Summary</h3>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">
                  {currency === 'NGN' ? '₦' : '$'}{(amount / 100).toLocaleString()}
                </span>
              </div>
            </div>
            <Button 
              type="button"
              onClick={handlePayment}
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Payment...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpenState) => {
        // Only allow closing if not in processing state
        if (paymentStatus === 'processing' && !newOpenState) {
          return;
        }
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent 
        className={`sm:max-w-[500px] max-h-[90vh] overflow-y-auto ${
          paymentStatus === 'processing' ? 'overflow-visible' : ''
        }`}
      >
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            {paymentStatus === 'idle' && 'Enter your payment details to continue'}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};