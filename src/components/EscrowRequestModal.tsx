
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface EscrowRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  onSuccess: (amount: number) => void;
}

const EscrowRequestModal = ({ open, onOpenChange, sellerName, onSuccess }: EscrowRequestModalProps) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!amount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    onSuccess(parsedAmount);
    onOpenChange(false);
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-market-green/20 mb-4">
            <ShieldCheck className="text-market-green w-8 h-8" />
          </div>
          <DialogTitle className="text-gradient text-xl font-bold">
            Request Escrow Payment
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the amount you'd like to request from your customer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="pl-8 bg-secondary/50 border-none text-lg"
                autoFocus
              />
            </div>
          </div>
          
          <div className="bg-secondary/30 p-3 rounded-md text-sm">
            <p className="text-muted-foreground">
              ✓ Secure escrow protection
              <br/>
              ✓ Customer must approve before release
              <br/>
              ✓ Professional payment experience
            </p>
          </div>
          
          <Button type="submit" className="w-full bg-market-green hover:bg-market-green/90">
            Send Payment Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowRequestModal;
