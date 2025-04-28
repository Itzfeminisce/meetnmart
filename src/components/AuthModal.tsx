
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    // In a real app, this would trigger an API call to send OTP
    toast.success(`OTP sent to ${phoneNumber}`);
    setStep('otp');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      toast.error("Please enter a valid OTP");
      return;
    }
    
    // In a real app, this would verify the OTP with backend
    toast.success("Authentication successful!");
    onOpenChange(false);
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-morphism">
        <DialogHeader>
          <DialogTitle className="text-gradient text-xl font-bold">
            {step === 'phone' ? 'Enter your phone number' : 'Enter verification code'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {step === 'phone' 
              ? "We'll send you a verification code to log in." 
              : `We've sent a code to ${phoneNumber}`}
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              type="tel"
              className="bg-secondary/50 border-none text-lg"
              autoFocus
            />
            <Button type="submit" className="w-full bg-market-orange hover:bg-market-orange/90">
              Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="bg-secondary/50 border-none text-center text-xl tracking-widest"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep('phone')}
                className="text-muted-foreground hover:text-foreground"
              >
                Change number
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => toast.success("New code sent!")}
                className="text-market-blue hover:text-market-blue/90"
              >
                Resend code
              </Button>
            </div>
            <Button type="submit" className="w-full bg-market-orange hover:bg-market-orange/90">
              Verify & Login
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
