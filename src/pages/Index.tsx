
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShoppingBasket } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut, profile, userRole, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (!userRole) {
        navigate('/role-selection');
      } else if (userRole === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/markets');  // Changed from buyer-dashboard to markets
      }
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = async () => {
    window.location.reload()
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="flex-grow flex flex-col p-4 animate-fade-in items-center justify-center">
        <div className="glass-morphism max-w-md w-full p-6 rounded-xl mb-8">
          <div className="mb-8 text-center">
            <span className="font-bold text-5xl">
              Meet<span className="text-market-orange">n'</span><span className="text-market-purple">Mart</span>
            </span>
            <p className="text-xl text-muted-foreground">
              Connect with local sellers through LIVE video
            </p>
          </div>

          <div className="grid gap-4">
            {!isAuthenticated && <SocialAuthButtons redirectTo={window.location.origin} flow='login' providers={['google']} />}
            <Button disabled={isLoading}
              size="lg"
              onClick={handleGetStarted}
              className="bg-market-orange hover:bg-market-orange/90"
            >
              <ShoppingBasket className="mr-2 h-4 w-4" />
              {user ? 'Browse Markets' : 'Get Started'}
            </Button>

            {isAuthenticated ? (
              <Button disabled={isLoading}
                variant="outline"
                onClick={signOut}
                className="bg-secondary/50 border-none"
              >
                Sign Out
              </Button>
            ) : (
              <Button disabled={isLoading}
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="bg-secondary/50 border-none"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                Continue with Phone
              </Button>
            )}
          </div>

          <div className="mt-8 text-sm text-muted-foreground text-center">
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
