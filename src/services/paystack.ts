
// @/services/paystack.ts
import Paystack from "@paystack/inline-js";

export type PaystackConfig = {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  onSuccess: (response: any) => void;
  onClose?: () => void;
  metadata?: Record<string, any>;
  channels?: Array<'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer'>;
};

// Track transaction history for first-time transaction detection
const transactionHistory = new Map<string, number>();

export const isFirstTransaction = (userId: string): boolean => {
  return !transactionHistory.has(userId) || transactionHistory.get(userId) === 1;
};

export const recordTransaction = (userId: string): void => {
  const currentCount = transactionHistory.get(userId) || 0;
  transactionHistory.set(userId, currentCount + 1);
};

export const loadPaystack = (onLoaded: (loaded: boolean) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        onLoaded(true);
        resolve(Paystack);
      }, 500);
    } catch (error) {
      onLoaded(false);
      reject(error);
    }
  });
};

// Helper to initialize Paystack with proper configuration
export const initializePaystack = (config: PaystackConfig): Paystack => {
  return new Paystack(config);
};
