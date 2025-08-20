import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Form, FormField, FormMessage, FormItem, FormControl, FormLabel } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CustomDialog from './ui/custom-dialog';
import { Transaction } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { CallAction } from '@/types/call';
import { EscrowData } from '@/contexts/live-call-context';
import { toast } from 'sonner';

const formSchema = z.object({
    feedback: z.string().nullable(),
})

interface ReleaseConfirmationProps {
    onCancel?: () => void;
    open: boolean;
    onOpenChange: (arg: boolean) => void;
    transaction: Transaction['Returns'][number];
}

const ReleaseConfirmation: React.FC<ReleaseConfirmationProps> = ({ transaction, onCancel, onOpenChange, open }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            feedback: ''
        }
    });

    const [confirmed, setConfirmed] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const { publish, subscribe, unsubscribe } = useSocket();

    const handleConfirmChange = () => {
        setConfirmed(!confirmed);
    };

    const onSubmit = async () => {
        try {
            if (!confirmed) {
                toast.info("Please confirm that you want to release the funds");
                return;
            }

            setSubmitting(true);
            setError(null);

            const { amount, description, ...metadata } = transaction;
            publish(CallAction.EscrowReleased, {
                caller: {
                    id: transaction.buyer_id,
                    name: transaction.buyer_name
                },
                receiver: {
                    id: transaction.seller_id,
                    name: transaction.seller_name
                },
                data: {
                    amount,
                    itemDescription: description.metadata.itemDescription,
                    itemTitle: description.metadata.itemTitle,
                    feedback: form.getValues().feedback,
                    ...metadata
                },
                room: undefined
            } as EscrowData);

            toast.info("We are attempting to notify seller about this change. We will get in touch shortly.")
            setTimeout(() => onOpenChange(false), 1500)
        } catch (error: any) {
            setError(error.message);
            setSubmitting(false);
        }
    };

    useEffect(() => {
        // Set up the event listener for the escrow release confirmation
        const handleEscrowReleased = (response: { status: "error" | "success", message: string }) => {
            setSubmitting(false);
            setSubmitted(true);
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

        // Subscribe to the event
        subscribe(CallAction.EscrowReleased, handleEscrowReleased);

        // Clean up function to unsubscribe when component unmounts
        // return () => {
        //     unsubscribe(CallAction.EscrowReleased, handleEscrowReleased);
        // };
    }, [subscribe, unsubscribe]);

    return (
        <CustomDialog
            showSubmitButton={!submitted}
            onOpenChange={onOpenChange}
            open={open}
            form={form}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitButtonText={submitting ? "Processing..." : "Release Funds"}
            // ={submitting || !confirmed}
            dialogTitle={submitted ? 'Funds Released Successfully' : 'Release Funds Confirmation'}>
            {submitted ? (
                <Card className="shadow-md border-green-200 bg-green-50 p-4">
                    <CardContent>
                        <p className="text-green-700">
                            You have successfully released {formatCurrency(transaction.amount)} to the seller.
                            The transaction is now complete.
                        </p>
                        {form.getValues().feedback && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <p className="text-sm font-medium text-green-700">Your feedback:</p>
                                    <p className="text-green-700 mt-1">{form.getValues().feedback}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Form {...form}>
                    <form>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Alert className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                You're about to release <b>{formatCurrency(transaction.amount)}</b> from escrow to {transaction.seller_name}.
                                This action cannot be undone.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium mb-2">Transaction Summary</p>
                                <div className="p-3 rounded-md bg-market-orange/10">
                                    <div className="grid grid-cols-2 items-center justify-center gap-2 text-sm space-y-6">
                                        <div className="text-muted-foreground">Transaction Ref:</div>
                                        <div className="font-medium">{transaction.reference}</div>
                                        <div className="text-muted-foreground">Service:</div>
                                        <div className="font-medium">{transaction.description?.metadata.itemTitle}</div>

                                        <div className="text-muted-foreground">Amount:</div>
                                        <div className="font-medium text-green-600">{formatCurrency(transaction.amount)}</div>

                                        <div className="text-muted-foreground">Seller:</div>
                                        <div className="font-medium">{transaction.seller_name}</div>
                                    </div>
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="feedback"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Feedback (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Share any feedback about the service or experience"
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-start space-x-2 pt-2">
                                <Checkbox
                                    id="confirm-release"
                                    checked={confirmed}
                                    onCheckedChange={handleConfirmChange}
                                    disabled={submitting}
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="confirm-release"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I confirm that the service was completed satisfactorily and I want to release the funds to the seller.
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </CustomDialog>
    );
};

export { ReleaseConfirmation };