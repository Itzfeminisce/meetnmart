// @/services/paystack.ts
import Paystack from "@paystack/inline-js"
// declare global {
//     interface Window {
//       Paystack: any;
//     }
//   }

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

export const loadPaystack = (onLoaded: (loaded: boolean) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(Paystack), 500)
  });
};