
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const AuthModal = ({ open, onOpenChange, onSuccess }: AuthModalProps) => {
  const { signInWithPhone, verifyOTP, fetchUserProfile} = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const { error } = await signInWithPhone(formattedPhone);
    
    setIsLoading(false);
    if (error) {
      toast.error(error.message || "Failed to send verification code");
      return;
    }
    
    toast.success(`OTP sent to ${formattedPhone}`);
    setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid OTP");
      return;
    }
    
    setIsLoading(true);
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    
    const { error } = await verifyOTP(formattedPhone, otp);
    
    setIsLoading(false);
    if (error) {
      toast.error(error.message || "Invalid verification code");
      return;
    }

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
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              className="w-full bg-market-orange hover:bg-market-orange/90"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="flex justify-center py-4">
              <InputOTP 
                value={otp} 
                onChange={setOtp}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex justify-between items-center">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep('phone')}
                className="text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                Change number
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => handlePhoneSubmit({ preventDefault: () => {} } as React.FormEvent)}
                className="text-market-blue hover:text-market-blue/90"
                disabled={isLoading}
              >
                Resend code
              </Button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-market-orange hover:bg-market-orange/90"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify & Login'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
