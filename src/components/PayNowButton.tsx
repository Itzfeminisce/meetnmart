import React from 'react';
import { Button } from '@/components/ui/button';
import { PaystackInlinePayment } from './PaystackInlinePayment';

export type PayNowButtonProps = {
  amount: number;
  email: string;
  onSuccess: (response: any) => void;
  onPaymentStart?: () => void;
  className?: string;
  buttonText?: string;
  disabled?: boolean;
  metadata?: Record<string, any>;
};

export const PayNowButton = ({
  amount,
  email,
  onSuccess,
  onPaymentStart,
  className = '',
  buttonText = 'Pay Now',
  disabled = false,
  metadata,
}: PayNowButtonProps) => {
  return (
    <PaystackInlinePayment
      amount={amount}
      email={email}
      onSuccess={onSuccess}
      onPaymentStart={onPaymentStart}
      className={className}
      buttonText={buttonText}
      disabled={disabled}
      metadata={metadata}
    />
  );
};
