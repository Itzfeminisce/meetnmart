import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { X, ShieldCheck, AlertCircle, ArrowRight, ExternalLink, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { PayNowButton } from "./PayNowButton";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EscrowData } from "@/contexts/live-call-context";

interface EscrowPaymentConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  payload: EscrowData
  onAccept: () => void;
  onReject: () => void;
}

const EscrowPaymentConfirmModal = ({
  payload,
  open,
  onOpenChange,
  sellerName,
  onAccept,
  onReject
}: EscrowPaymentConfirmModalProps) => {
  const { user } = useAuth();
  const [paymentStarted, setPaymentStarted] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Handle payment initialization - close the dialog
  const handlePaymentStart = () => {
    if (!acceptedTerms) {
      toast.error("Please accept the terms of service to continue");
      return;
    }

    setPaymentStarted(true);
    onOpenChange(false); // Close the dialog to avoid interaction conflicts
  };

  // Handle successful payment
  const handlePaymentSuccess = (response: any) => {
    setPaymentSuccessful(true);
    setPaymentReference(response.reference);

    // Wait a moment to let the Paystack popup close
    setTimeout(() => {
      onAccept(); // Process the acceptance logic

      // If we still want to show a success in the modal
      if (response.reference) {
        // Re-open dialog with success message
        onOpenChange(true);
      } else {
        // Just show a toast if we don't want to reopen
        toast.success(`Payment of ${payload.data.amount.toFixed(2)} successfully moved to escrow!`);
      }
    }, 500);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
    toast.info(`Payment request rejected`);
  };

  // Reset state when dialog opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !paymentStarted) {
      // Only allow closing if payment hasn't started
      onOpenChange(false);
    } else if (isOpen && !paymentSuccessful && !paymentStarted) {
      // Reset state when reopening
      setPaymentStarted(false);
      onOpenChange(true);
    }
  };

  // Show success view if payment was successful
  if (open && paymentSuccessful && paymentReference) {
    return (
      <Dialog open={open} onOpenChange={() => {
        setPaymentSuccessful(false);
        setPaymentReference(null);
        setAcceptedTerms(false);
        setIsDetailsOpen(false);
        onOpenChange(false);
      }}>
        <DialogContent className="sm:max-w-md glass-morphism max-h-[90vh]">
          <ScrollArea className="max-h-[80vh] pr-4">
            <DialogHeader className="flex flex-col items-center text-center mb-2">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
                <ShieldCheck className="text-market-green w-8 h-8" />
              </div>
              <DialogTitle className="text-gradient text-xl font-bold">
                Payment Successfully Moved to Escrow!
              </DialogTitle>
              <div className="text-xl font-bold text-market-green my-4">
                ${payload.data.amount.toFixed(2)}
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-market-green/10 p-4 rounded-md text-sm">
                <p className="text-muted-foreground mb-2">
                  <strong>Payment Details:</strong>
                </p>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span>Item:</span>
                    <span className="font-semibold">{payload.data.itemTitle}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">${payload.data.amount.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Seller:</span>
                    <span className="font-semibold">{sellerName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-semibold">{new Date().toLocaleTimeString()}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Reference:</span>
                    <span className="font-mono text-xs">{paymentReference}</span>
                  </p>
                </div>
              </div>

              {payload.data.itemDescription && (
                <Collapsible
                  open={isDetailsOpen}
                  onOpenChange={setIsDetailsOpen}
                  className="bg-secondary/30 p-4 rounded-md text-sm w-full"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground font-medium">
                      Item Description
                    </p>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isDetailsOpen ? "transform rotate-180" : ""
                            }`}
                        />
                        <span className="sr-only">Toggle details</span>
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="mt-2 space-y-2 overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <p className="text-sm leading-relaxed">{payload.data.itemDescription}</p>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="bg-blue-500/10 p-4 rounded-md text-sm">
                <p className="flex items-center gap-2 text-blue-500 mb-2">
                  <AlertCircle size={16} />
                  <strong>What happens next?</strong>
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  <li>The funds have been securely placed in escrow</li>
                  <li>The seller will be notified to proceed with the service/delivery</li>
                  <li>Once you confirm receipt and satisfaction, the funds will be released</li>
                  <li>If there are any issues, you can open a dispute within 7 days</li>
                </ol>
              </div>

              <Button
                className="w-full bg-market-green hover:bg-market-green/90"
                onClick={() => {
                  setPaymentSuccessful(false);
                  setPaymentReference(null);
                  setAcceptedTerms(false);
                  setIsDetailsOpen(false);
                  onOpenChange(false);
                }}
              >
                Close
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Regular payment request view
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism max-h-[90vh]">
        <ScrollArea className="max-h-[80vh] pr-4">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
              <ShieldCheck className="text-market-green w-8 h-8" />
            </div>
            <DialogTitle className="text-gradient text-xl font-bold">
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You are about to make a secure payment to <b>{sellerName}</b>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="bg-market-green/10 p-4 rounded-md">
              <div className="text-2xl font-bold text-market-green text-center mb-2">
                ${payload.data.amount.toFixed(2)}
              </div>

              <Collapsible
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center gap-1 mx-auto text-sm text-muted-foreground hover:text-foreground"
                  >
                    <span>View Details</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${isDetailsOpen ? "transform rotate-180" : ""
                        }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Title:</p>
                      <p className="text-sm text-muted-foreground"> {payload.data.itemTitle}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-1">Description:</p>
                      <p className="text-sm text-muted-foreground">{payload.data.itemDescription}</p>
                    </div>

                    <div className="bg-market-orange/10 p-1 rounded-md">
                      <p className="text-market-orange text-xs">Confirm that the provided details conforms with your agreement with the seller before proceeding to payment.</p>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            <div className="bg-secondary/30 p-4 rounded-md text-sm">
              <p className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-market-green" />
                <strong>Escrow Protection:</strong>
              </p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                  <span>Your payment will be held securely in escrow</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                  <span>Funds will only be released when you confirm receipt</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                  <span>Money-back guarantee if service is not delivered as agreed</span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight size={14} className="mt-1 flex-shrink-0" />
                  <span>Disputes can be filed if there are any issues</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-md text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="terms-checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-market-green focus:ring-market-green"
                />
                <label htmlFor="terms-checkbox" className="text-muted-foreground">
                  By proceeding, I agree to the <Link to="/terms" className="text-blue-500 hover:underline inline-flex items-center">Terms of Service<ExternalLink size={12} className="ml-1" /></Link>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleReject}
              >
                <X size={18} className="mr-2" />
                Cancel
              </Button>

              <PayNowButton
                amount={payload.data.amount}
                email={user?.email || "customer@example.com"}
                onSuccess={handlePaymentSuccess}
                onPaymentStart={handlePaymentStart}
                className={`bg-market-green hover:bg-market-green/90 ${!acceptedTerms ? 'opacity-60 cursor-not-allowed' : ''}`}
                buttonText="Confirm & Pay"
                disabled={!acceptedTerms}
                metadata={{
                  custom_fields: [
                    {
                      display_name: "Seller",
                      variable_name: "seller",
                      value: payload.receiver.name
                    },
                    {
                      display_name: "Buyer",
                      variable_name: "buyer",
                      value: payload.caller.name
                    },
                    {
                      display_name: "Title",
                      variable_name: "itemTitle",
                      value: payload.data.itemTitle
                    },
                    {
                      display_name: "Description",
                      variable_name: "itemDescription",
                      value: payload.data.itemDescription
                    },
                    {
                      display_name: "Amount",
                      variable_name: "amount",
                      value: payload.data.amount
                    },
                  ]
                }}
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowPaymentConfirmModal;