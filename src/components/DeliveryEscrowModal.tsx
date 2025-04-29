import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeliveryAgent } from '@/types';

interface DeliveryEscrowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveryAgent: DeliveryAgent;
  onSuccess: (amount: number) => void;
}

const DeliveryEscrowModal = ({ 
  open, 
  onOpenChange, 
  deliveryAgent,
  onSuccess 
}: DeliveryEscrowModalProps) => {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setError('');
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      
      // Simulate another delay before closing and calling onSuccess
      setTimeout(() => {
        onSuccess(parseFloat(amount));
        onOpenChange(false);
        
        // Reset the modal state after it's closed
        setTimeout(() => {
          setAmount('');
          setIsComplete(false);
        }, 1000);
      }, 5500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck size={20} className="text-market-orange" />
            <span>Delivery Payment Escrow</span>
          </DialogTitle>
          <DialogDescription>
            Set up an escrow payment for delivery services with {deliveryAgent?.name}.
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Escrow Amount</Label>
              <div className="relative">
                <DollarSign 
                  size={16} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                />
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  step="0.01"
                  min="0"
                  disabled={isProcessing}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This amount will be held in escrow until the delivery is confirmed.
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Create Escrow Payment'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-6 space-y-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-full bg-market-green/20 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-market-green" />
              </div>
              <h3 className="text-xl font-semibold">Escrow Created!</h3>
              <p className="text-muted-foreground mt-2">
                ${parseFloat(amount).toFixed(2)} has been placed in escrow for delivery services.
                The funds will be released when delivery is confirmed complete.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryEscrowModal;