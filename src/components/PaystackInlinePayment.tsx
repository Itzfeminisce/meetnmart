// @/components/PaystackInlinePayment.tsx
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getEnvVar } from '@/lib/utils';

// Add this missing type if not already defined
declare global {
  interface Window {
    PaystackPop: any;
  }
}

type PaymentStatus = 'idle' | 'loading' | 'processing' | 'success' | 'failed';

interface PaystackInlinePaymentProps {
  amount: number;
  email: string;
  buttonText?: string | React.ReactNode;
  onSuccess?: (response: any) => void;
  metadata?: Record<string, any>;
  reference?: string;
  className?: string;
  currency?: string;
  onPaymentStart?: () => void; // New prop to handle dialog closing
  disabled: boolean;
}

export const PaystackInlinePayment = ({
  amount,
  email,
  buttonText = "Pay Now",
  disabled,
  onSuccess,
  metadata = {
    custom_fields: [
      {
        display_name: "Order ID",
        variable_name: "order_id",
        value: Math.floor(Math.random() * 1000000).toString()
      }
    ]
  },
  reference,
  className = "",
  currency = "NGN",
  onPaymentStart, // New prop to handle dialog closing
}: PaystackInlinePaymentProps) => {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  
  // Get the public key from environment variables
  const PAYSTACK_PUBLIC_KEY = getEnvVar("PAYSTACK_PUBLIC_KEY") || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

  // Load Paystack script
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      toast.error("Payment gateway could not be loaded");
      setStatus('failed');
    };
    
    document.body.appendChild(script);
    scriptRef.current = script;
    
    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  const handlePayment = () => {
    if (!paystackLoaded) {
      setStatus('loading');
      return;
    }

    setStatus('processing');
    
    // Call onPaymentStart to close the parent dialog
    if (onPaymentStart) {
      onPaymentStart();
    }
    
    try {
      const paystack = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Convert to kobo/cents
        currency,
        ref: reference || `REF_${Date.now()}`,
        metadata,
        channels: ['card', 'bank', 'ussd'],
        label: 'Payment',
        onClose: () => {
          setStatus('idle');
          toast.info('Payment window closed');
        },
        callback: (response: any) => {
          setStatus('success');
          toast.success(`Payment successful: ${response.reference}`);
          if (onSuccess) {
            onSuccess(response);
          }
          // Reset status after some time
          setTimeout(() => setStatus('idle'), 3000);
        },
      });
      
      // Small delay to ensure any closing animations complete
      setTimeout(() => {
        paystack.openIframe();
      }, 100);
    } catch (error) {
      console.error("Paystack error:", error);
      toast.error("Payment could not be initiated");
      setStatus('failed');
    }
  };

  const getButtonContent = () => {
    switch (status) {
      case 'loading':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading payment...
          </>
        );
      case 'processing':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Payment Successful
          </>
        );
      case 'failed':
        return (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            Payment Failed
          </>
        );
      default:
        return buttonText;
    }
  };

  return (
    <Button
      type="button"
      onClick={handlePayment}
      disabled={disabled || (status === 'processing' || status === 'loading')}
      className={`bg-market-green hover:bg-market-green/90 ${className}`}
      variant={status === 'success' ? 'outline' : 'default'}
    >
      {getButtonContent()}
    </Button>
  );
};