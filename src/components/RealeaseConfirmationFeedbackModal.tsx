
import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { z } from 'zod';
import CustomDialog from './ui/custom-dialog';
import { useSocket } from '@/contexts/SocketContext';
import { CallAction } from '@/types/call';
import { toast } from 'sonner';

interface RealeaseConfirmationFeedbackModalProps {
    onCancel?: () => void;
    open: boolean;
    onOpenChange: (arg: boolean) => void;
    feedback?:string;
    amount: number
}

const RealeaseConfirmationFeedbackModal: React.FC<RealeaseConfirmationFeedbackModalProps> = ({ amount, feedback, onCancel, onOpenChange, open }) => {
    const {unsubscribe} = useSocket()


    useEffect(() => {
        // Set up the event listener for the escrow release confirmation
        const handleEscrowReleased = (response: { status: "error" | "success", message: string }) => {
            onOpenChange(true)

            // if (response.status === "error") {
            //     toast(response.message, {
            //         action: {
            //             label: "Retry",
            //             onClick(event) {
            //                 // subscribe(CallAction.EscrowReleased, handleEscrowReleased);
            //             },
            //         },
            //        duration: 2000
            //     })
            // } else {
            toast.success(response.message)
            unsubscribe(CallAction.EscrowReleased, handleEscrowReleased);
            // }
        };
    }, [unsubscribe]);

    return (
        <CustomDialog
            showSubmitButton={false}
            onOpenChange={onOpenChange}
            open={open}
            // @ts-ignore
            onCancel={onOpenChange}
            dialogTitle={'Funds Released Successfully'}>
            <Card className="shadow-md border-green-200 bg-green-50 p-4">
                <CardContent>
                    <p className="text-green-700">
                        You have successfully released {formatCurrency(amount)} to the seller.
                        The transaction is now complete.
                    </p>
                    {feedback && (
                        <>
                            <Separator className="my-4" />
                            <div>
                                <p className="text-sm font-medium text-green-700">Your feedback:</p>
                                <p className="text-green-700 mt-1">{feedback}</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </CustomDialog>
    );
};

export { RealeaseConfirmationFeedbackModal };