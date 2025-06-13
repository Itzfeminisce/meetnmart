import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AppData } from '@/types/call';

interface EscrowRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: {
    amount: number;
    itemTitle: string;
    itemDescription: string;
  }) => void;
}

// Define zod schema for form validation
const formSchema = z.object({
  itemTitle: z.string()
    .min(1, "Please enter an item title")
    .max(100, "Title must be less than 100 characters"),
  amount: z.string()
    .min(1, "Please enter an amount")
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Please enter a valid amount greater than 0"),
  itemDescription: z.string()
    .min(1, "Please enter an item description"),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms of service" }),
  }),
});

// Type for our form
type FormValues = z.infer<typeof formSchema>;

const EscrowRequestModal = ({
  open,
  onOpenChange,
  onSuccess
}: EscrowRequestModalProps) => {
  // Initialize form with zod resolver
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemTitle: "",
      amount: "",
      itemDescription: "",
      // @ts-ignore
      acceptedTerms: false
    },
  });

  const handleSubmit = (values: FormValues) => {
    onSuccess({
      amount: parseFloat(values.amount),
      itemTitle: values.itemTitle.trim(),
      itemDescription: values.itemDescription.trim()
    });

    onOpenChange(false);

    // Reset the form
    form.reset();

    toast.success("Payment request sent successfully!");
  };

  // Reset form when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism max-h-[90vh] p-4">
        <ScrollArea className="max-h-[80vh]">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
              <ShieldCheck className="text-market-green w-8 h-8" />
            </div>
            <DialogTitle className="text-gradient text-xl font-bold">
              Request Payment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a secure payment request for your customer
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 md:p-4">
              <FormField
                control={form.control}
                name="itemTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Item Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. Logo Design Service"
                        className="bg-secondary/50 border-none"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Amount <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{AppData.CurrencySymbol}</span>
                        <Input
                          {...field}
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-8 bg-secondary/50 border-none text-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="itemDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe what you're offering to your customer..."
                        className="bg-secondary/50 border-none min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground">
                      This description will be shown to your customer in the payment request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-secondary/30 p-4 rounded-md text-sm">
                <p className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-market-green" />
                  <strong>Escrow Benefits:</strong>
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                    <span>Secure payment held in escrow until customer approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                    <span>Professional transaction experience for your customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                    <span>Protection for both you and your customer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                    <span>Automated payment system with receipts and references</span>
                  </li>
                </ul>
              </div>

              <FormField
                control={form.control}
                name="acceptedTerms"
                render={({ field }) => (
                  <FormItem className="bg-blue-500/10 p-4 rounded-md text-sm">
                    <div className="flex items-start">
                      <FormControl>
                        <input
                          type="checkbox"
                          id="terms-checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mr-2 h-4 w-4 mt-0.5 rounded border-gray-300 text-market-green focus:ring-market-green"
                        />
                      </FormControl>
                      <FormLabel htmlFor="terms-checkbox" className="text-muted-foreground">
                        I confirm that the information provided is accurate and I agree to the <Link to="/terms" className="text-blue-500 hover:underline inline-flex items-center">Terms of Service<ExternalLink size={12} className="ml-1" /></Link>
                      </FormLabel>
                    </div>
                    <FormMessage className="pl-6" />
                  </FormItem>
                )}
              />

              <Button
                disabled={!form.getValues().acceptedTerms}
                type="submit"
                className="w-full bg-market-green hover:bg-market-green/90"
              >
                Send Payment Request
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowRequestModal;