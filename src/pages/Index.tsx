import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShoppingBasket } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, isLoading, signOut, profile, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, check their status
    if (user && !isLoading) {
      // If they haven't selected a role yet, redirect to role selection
      if (!userRole) {
        navigate('/role-selection');
        return;
      }
      
      // Otherwise redirect to appropriate dashboard
      if (profile?.is_seller) {
        navigate('/seller-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    }
  }, [user, isLoading, navigate, profile, userRole]);

  const handleGetStarted = () => {
    if (user) {
      if (!userRole) {
        navigate('/role-selection');
      } else if (profile?.is_seller) {
        navigate('/seller-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    // After authentication, the useEffect will handle redirection
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="glass-morphism max-w-md p-6 rounded-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="text-gradient">Virtual Markets</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with local sellers through live video
            </p>
          </div>

          <div className="grid gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-market-orange hover:bg-market-orange/90"
            >
              <ShoppingBasket className="mr-2 h-4 w-4" />
              {user ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            
            {user ? (
              <Button 
                variant="outline"
                onClick={signOut}
                className="bg-secondary/50 border-none"
              >
                Sign Out
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShowAuthModal(true)}
                className="bg-secondary/50 border-none"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Continue with Phone
              </Button>
            )}
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>Test credentials: +15086842093, OTP: 123456</p>
          </div>
        </div>
      </main>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
