
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Check, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface EscrowPaymentConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  amount: number;
  onAccept: () => void;
  onReject: () => void;
}

const EscrowPaymentConfirmModal = ({ 
  open, 
  onOpenChange, 
  sellerName, 
  amount, 
  onAccept, 
  onReject 
}: EscrowPaymentConfirmModalProps) => {
  
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
    toast.success(`Payment of $${amount.toFixed(2)} accepted!`);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
    toast.info(`Payment request rejected`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
            <ShieldCheck className="text-market-green w-8 h-8" />
          </div>
          <DialogTitle className="text-gradient text-xl font-bold">
            Payment Request
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {sellerName} is requesting an escrow payment of:
          </DialogDescription>
          <div className="text-3xl font-bold text-market-green my-4">
            ${amount.toFixed(2)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-secondary/30 p-3 rounded-md text-sm">
            <p className="text-muted-foreground">
              ✓ Money-back guarantee
              <br/>
              ✓ Released only when you approve
              <br/>
              ✓ Quick refund if service not delivered
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleReject}
            >
              <X size={18} className="mr-2" />
              Reject
            </Button>
            <Button 
              className="bg-market-green hover:bg-market-green/90"
              onClick={handleAccept}
            >
              <Check size={18} className="mr-2" />
              Pay Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowPaymentConfirmModal;
