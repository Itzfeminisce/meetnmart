import React, { useRef, useState } from 'react';
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

const formSchema = z.object({
    feedback: z.string().nullable(),
    // confirmed: z.boolean()
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
    })

    const [confirmed, setConfirmed] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleConfirmChange = () => {
        setConfirmed(!confirmed);
    };

    const onSubmit = async () => {
        console.log("Submitted");

        setSubmitting(true);
        setError(null);

        try {
            // if (!confirmed) {
            //     throw new Error("Please confirm that you want to release the funds");
            // }

            // Here you would send the request to your API
            // const response = await api.post('/transactions/release', { 
            //   transactionId: transaction.id,
            //   feedback
            // });

            // Simulating API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Failed to release funds. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomDialog
            showSubmitButton={!submitted}
            onOpenChange={onOpenChange}
            open={open}
            form={form}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitButtonText={submitting ? "Processing..." : "Release Funds"}
            dialogTitle={submitted ? ' Funds Released Successfully' : ' Release Funds Confirmation '}>
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
            ) :
                (
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
                                    <div className="p-3 rounded-md  bg-market-orange/10">
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
                                >

                                </FormField>

                                <div className="flex items-start space-x-2 pt-2">
                                    <Checkbox
                                        id="confirm-release"
                                        checked={confirmed}
                                        onCheckedChange={handleConfirmChange}
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
    )

    // return (
    //     <Dialog open={true} onOpenChange={() => false}>
    //         <DialogContent className="glass-morphism p-4 w-full">
    //             <DialogHeader className="flex flex-col items-center text-center">
    //                 <DialogTitle className="text-gradient text-2xl font-bold">
    //                     {submitted ? ' Funds Released Successfully' : ' Release Funds Confirmation '}
    //                 </DialogTitle>

    //             </DialogHeader>


    //             <ScrollArea className="max-h-[60vh]">
    //                 {submitted ? (
    //                     <Card className="shadow-md border-green-200 bg-green-50 p-4">
    //                         <CardContent>
    //                             <p className="text-green-700">
    //                                 You have successfully released {formatCurrency(transaction.amount)} to the seller.
    //                                 The transaction is now complete.
    //                             </p>
    //                             {form.getValues().feedback && (
    //                                 <>
    //                                     <Separator className="my-4" />
    //                                     <div>
    //                                         <p className="text-sm font-medium text-green-700">Your feedback:</p>
    //                                         <p className="text-green-700 mt-1">{form.getValues().feedback}</p>
    //                                     </div>
    //                                 </>
    //                             )}
    //                         </CardContent>
    //                     </Card>
    //                 ) :
    //                     (
    //                         <Form {...form}>
    //                             <form className='max-w-[90%] mx-auto' ref={formRef}>
    //                                 {error && (
    //                                     <Alert variant="destructive" className="mb-4">
    //                                         <AlertCircle className="h-4 w-4" />
    //                                         <AlertTitle>Error</AlertTitle>
    //                                         <AlertDescription>{error}</AlertDescription>
    //                                     </Alert>
    //                                 )}

    //                                 <Alert className="mb-4">
    //                                     <AlertCircle className="h-4 w-4" />
    //                                     <AlertDescription>
    //                                         You're about to release {formatCurrency(transaction.amount)} from escrow to {transaction.participants.seller.name}.
    //                                         This action cannot be undone.
    //                                     </AlertDescription>
    //                                 </Alert>

    //                                 <div className="space-y-4">
    //                                     <div>
    //                                         <p className="text-sm font-medium mb-2">Transaction Summary</p>
    //                                         <div className="bg-slate-50 p-3 rounded-md  bg-secondary/10">
    //                                             <div className="grid grid-cols-2 gap-2 text-sm space-y-6">
    //                                                 <div className="text-muted-foreground">Transaction ID:</div>
    //                                                 <div className="font-medium">{transaction.id}</div>

    //                                                 <div className="text-muted-foreground">Service:</div>
    //                                                 <div className="font-medium">{transaction.title}</div>

    //                                                 <div className="text-muted-foreground">Amount:</div>
    //                                                 <div className="font-medium text-green-600">{formatCurrency(transaction.amount)}</div>

    //                                                 <div className="text-muted-foreground">Seller:</div>
    //                                                 <div className="font-medium">{transaction.participants.seller.name}</div>
    //                                             </div>
    //                                         </div>
    //                                     </div>

    //                                     <FormField
    //                                         control={form.control}
    //                                         name="feedback"
    //                                         render={({ field }) => (
    //                                             <FormItem>
    //                                                 <FormLabel>Feedback (optional)</FormLabel>
    //                                                 <FormControl>
    //                                                     <Textarea
    //                                                         rows={3}
    //                                                         placeholder="Share any feedback about the service or experience"
    //                                                         className="resize-none"
    //                                                         {...field}
    //                                                     />
    //                                                 </FormControl>
    //                                                 <FormMessage />
    //                                             </FormItem>
    //                                         )}
    //                                     >

    //                                     </FormField>

    //                                     <div className="flex items-start space-x-2 pt-2">
    //                                         <Checkbox
    //                                             id="confirm-release"
    //                                             checked={confirmed}
    //                                             onCheckedChange={handleConfirmChange}
    //                                         />
    //                                         <div className="grid gap-1.5 leading-none">
    //                                             <Label
    //                                                 htmlFor="confirm-release"
    //                                                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    //                                             >
    //                                                 I confirm that the service was completed satisfactorily and I want to release the funds to the seller.
    //                                             </Label>
    //                                         </div>
    //                                     </div>
    //                                 </div>

    //                             </form>
    //                         </Form>
    //                     )}
    //             </ScrollArea>

    //             <DialogFooter>
    //                 <div className="flex justify-end gap-3 mt-6">
    //                     <Button
    //                         type="button"
    //                         variant="outline"
    //                         onClick={onCancel}
    //                         disabled={submitting}
    //                     >
    //                         Cancel
    //                     </Button>
    //                     {
    //                         !submitted && (
    //                             <Button
    //                                 onClick={form.handleSubmit(onSubmit)}
    //                                 type="submit"
    //                                 disabled={submitting || !confirmed}
    //                                 className="bg-green-600 hover:bg-green-700 text-white"
    //                             >
    //                                 {submitting ? "Processing..." : "Release Funds"}
    //                             </Button>
    //                         )
    //                     }
    //                 </div>
    //             </DialogFooter>
    //         </DialogContent>
    //     </Dialog>
    // );
};

export { ReleaseConfirmation };