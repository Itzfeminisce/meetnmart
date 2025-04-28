
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface EscrowPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  onSuccess: () => void;
}

const EscrowPaymentModal = ({ open, onOpenChange, sellerName, onSuccess }: EscrowPaymentModalProps) => {
  const [amount, setAmount] = useState('');

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    // In a real app, this would process the payment
    toast.success(`Escrow payment of $${amount} created successfully!`);
    onOpenChange(false);
    setAmount('');
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
            <ShieldCheck className="text-market-green w-8 h-8" />
          </div>
          <DialogTitle className="text-gradient text-xl font-bold">
            Secure Escrow Payment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your payment will be held securely until you confirm delivery from {sellerName}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-8 bg-secondary/50 border-none text-lg"
              />
            </div>
          </div>
          
          <div className="bg-secondary/30 p-3 rounded-md text-sm">
            <p className="text-muted-foreground">
              ✓ Money-back guarantee
              <br/>
              ✓ Released only when you approve
              <br/>
              ✓ Quick refund if service not delivered
            </p>
          </div>
          
          <Button type="submit" className="w-full bg-market-green hover:bg-market-green/90">
            Create Secure Payment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowPaymentModal;
