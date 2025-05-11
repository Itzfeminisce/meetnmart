// @/contexts/paystack-context.tsx
import { loadPaystack } from '@/services/paystack';
import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

type PaystackContextType = {
  initializePayment: (config: PaystackConfig) => void;
  isInitializing: boolean;
  paymentError: string | null;
  resetPayment: () => void;
  paystackLoaded: boolean;
};

type PaystackConfig = {
  publicKey: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  metadata?: Record<string, any>;
  channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'>;
  container?: string;
};

const PaystackContext = createContext<PaystackContextType | undefined>(undefined);

export const PaystackProvider = ({ children }: { children: ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const _loadPaystack = useCallback(async () => {
    // if (typeof window !== 'undefined' && window.Paystack) {
    //   setPaystackLoaded(true);
    //   return window.Paystack;
    // }

    try {
      const paystackInstance = await loadPaystack(setPaystackLoaded);
      return paystackInstance;
    } catch (error) {
      console.error("Failed to load Paystack:", error);
      setPaymentError("Failed to load payment gateway");
      throw error;
    }
  }, []);

  const initializePayment = useCallback(async (config: PaystackConfig) => {
    setIsInitializing(true);
    setPaymentError(null);

    try {
      const Paystack = await _loadPaystack();
      
      // Initialize Paystack payment
      const payment = new Paystack();
      
      const paystackConfig = {
        key: config.publicKey,
        email: config.email,
        amount: config.amount * 100, // Convert to kobo
        currency: config.currency || 'NGN',
        reference: config.reference || `PSK_${Date.now()}`,
        channels: config.channels || ['card', 'bank', 'ussd'],
        metadata: config.metadata || {},
        onSuccess: (response: any) => {
          config.onSuccess(response);
          setIsInitializing(false);
        },
        onClose: () => {
          config.onClose?.();
          setIsInitializing(false);
        },
        onLoad: () => {
          console.log("Paystack iframe loaded");
          setPaystackLoaded(true);
        }
      };

      // If container is specified, use embedded mode
    //   if (config.container) {
    //     paystackConfig.container = config.container;
    //   }

      console.log("Initializing Paystack with config:", paystackConfig);
      payment.newTransaction(paystackConfig);
      
    } catch (error) {
      console.error("Paystack initialization error:", error);
      setPaymentError(error instanceof Error ? error.message : 'Payment initialization failed');
      setIsInitializing(false);
    }
  }, [_loadPaystack]);

  const resetPayment = useCallback(() => {
    setPaymentError(null);
    setIsInitializing(false);
  }, []);

  return (
    <PaystackContext.Provider
      value={{ initializePayment, isInitializing, paymentError, resetPayment, paystackLoaded }}
    >
      {children}
    </PaystackContext.Provider>
  );
};

export const usePaystack = () => {
  const context = useContext(PaystackContext);
  if (!context) {
    throw new Error('usePaystack must be used within a PaystackProvider');
  }
  return context;
};