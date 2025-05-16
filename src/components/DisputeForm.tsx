import React, { useState } from 'react';
import { AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CustomDialog from './ui/custom-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
    reason: z.string().min(1),
    description: z.string().min(1),
    evidence: z.string().min(1),
    email: z.string().min(1).email()
})

const DisputeForm = ({ transactionId, onCancel }) => {
    const [error, setError] = useState('')
    const [isSubmitted, setSubmitted] = useState(false)
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reason: '',
            description: '',
            evidence: '',
            email: ''
        }
    });


    const handleSubmit = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitted(true)
        } catch (error: any) {
            setError(error?.message)
        } finally {
            // setSubmitted(false)
        }

    };

    return (
        <CustomDialog
            showSubmitButton={!isSubmitted}
            onOpenChange={() => !true}
            open={true}
            form={form}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            submitButtonText={isSubmitted ? " Dispute Filed Successfully" : "Submit Dispute"}
            dialogTitle={isSubmitted ? 'Submitted, We shall revert.' : 'Lets hear from you'}>
            {isSubmitted ? (
                <Card className="shadow-md border-yellow-200 bg-yellow-50 p-4">
                    <CardContent className="space-y-2">
                        <p className="text-amber-700">
                            Your dispute for transaction <b>{transactionId}</b> has been filed.
                        </p>
                        <p className="text-amber-700">
                        Our support team will review your case and contact you within 2 business days.
                        </p>
                        <p className="mt-2 text-amber-700">
                            A copy of this dispute has been sent to your email address.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Form {...form}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reason for dispute</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue defaultValue={field.value} placeholder="Select a reason" />
                                                </SelectTrigger>
                                            </FormControl>

                                            <SelectContent >
                                                <SelectItem value="incomplete_service">Service Not Completed</SelectItem>
                                                <SelectItem value="quality_issues">Quality Issues</SelectItem>
                                                <SelectItem value="communication_problems">Communication Problems</SelectItem>
                                                <SelectItem value="not_as_described">Not As Described</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}

                            />
                        </div>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Describe the issue in detail</FormLabel>
                                        <FormControl>
                                            <Textarea {...field}
                                                rows={5}
                                                placeholder="Please provide as much detail as possible about the issue"
                                                className="resize-none"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}

                            />
                        </div>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="evidence"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Evidence or documentation (optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                rows={3}
                                                placeholder="Provide links to screenshots, recordings, messages, or other evidence supporting your case"
                                                className="resize-none"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}

                            />
                        </div>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact email</FormLabel>
                                        <FormControl>
                                            <>
                                                <Input
                                                    {...field}
                                                    placeholder="email@example.com"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    We'll contact you at this email with updates about your dispute.
                                                </p>
                                            </>
                                        </FormControl>
                                    </FormItem>
                                )}

                            />
                        </div>
                    </form>
                </Form>
            )}
        </CustomDialog>
    );
};

export { DisputeForm };