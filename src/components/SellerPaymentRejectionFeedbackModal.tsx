import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Lightbulb, MessageSquareText, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface SellerPaymentRejectionFeedbackProps {
  open: boolean;
  onClose: () => void;
  buyerName?: string;
}

export const SellerPaymentRejectionFeedbackModal = ({
  open,
  onClose,
  buyerName,
}: SellerPaymentRejectionFeedbackProps) => {
  const [isVisible, setIsVisible] = useState(open);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!open && !isVisible) return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0  z-50 transition-all duration-300 ease-in-out max-w-screen-md mx-auto',
        open ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ height: '50vh', maxHeight: '500px' }}
    >
      <Card className="h-full rounded-b-none rounded-t-xl shadow-lg flex flex-col bg-background border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-destructive w-5 h-5" />
              <h2 className="text-lg font-semibold">Your request was rejected</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <Alert variant="default" className="border-border">
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Tips for stronger buyer confidence</AlertTitle>
            <AlertDescription>
              {buyerName ? (
                <><b>{buyerName}</b> decided not to proceed with the payment.</>
              ) : <span>The buyer chose not to complete the payment.</span>}{' '}
              This can happen — here are a few ways to build stronger buyer confidence in future calls.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Tip
              icon={<MessageSquareText className="text-primary w-5 h-5 mt-0.5 flex-shrink-0" />}
              title="Set Clear Expectations"
              description="At the start of the call, briefly explain your process: pricing, delivery time, and payment flow. It helps buyers feel more in control."
            />
            <Tip
              icon={<Lightbulb className="text-primary w-5 h-5 mt-0.5 flex-shrink-0" />}
              title="Keep It Transparent"
              description="Share total costs upfront — including delivery. Be open about product availability, delays, or substitutions during the call."
            />
            <Tip
              icon={<ShieldCheck className="text-primary w-5 h-5 mt-0.5 flex-shrink-0" />}
              title="Build Trust Through Tone"
              description="A calm, respectful and helpful tone goes a long way. Even small gestures — like confirming the product matches what was requested — build buyer confidence."
            />
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button onClick={handleClose} className="w-full hover:bg-market-green/40 bg-market-green/80" variant="secondary">
            Thanks, I understand
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Small reusable tip block
const Tip = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    {icon}
    <div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);
