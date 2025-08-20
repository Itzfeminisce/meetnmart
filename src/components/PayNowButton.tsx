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
 
export const PayNowButton: React.FC<PayNowButtonProps> = ({
    amount,
    email,
    reference,
    metadata,
    onSuccess,
    buttonText = "Pay Now",
    className = "",
    disabled = true,
    onPaymentStart
}) => {
    const handlePaymentSuccess = (response: any) => {
        if (onSuccess) {
            onSuccess(response);
        }
    };

    return (
        <PaystackInlinePayment
            disabled={disabled}
            amount={amount}
            email={email}
            reference={reference}
            metadata={metadata}
            onSuccess={handlePaymentSuccess}
            onPaymentStart={onPaymentStart}
            buttonText={
                <>
                    <Check size={18} className="mr-2" />
                    {buttonText}
                </>
            }
            className={className}
        />
    );
};
 
