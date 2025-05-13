import React from 'react';
import { PaystackInlinePayment } from '@/components/PaystackInlinePayment';
import { Check } from 'lucide-react';

interface PayNowButtonProps {
    amount?: number;
    email?: string;
    reference?: string;
    metadata?: Record<string, any>;
    onSuccess?: (response: any) => void;
    buttonText?: string;
    className?: string;
    onPaymentStart?: () => void;
    disabled: boolean;
}

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