import { useEffect, useState } from 'react';
import { redirect, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShoppingBasket } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, signOut, profile, userRole, isAuthenticated, fetchUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate();


  const handleGetStarted = () => {
    if (isAuthenticated) {
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

  const handleAuthSuccess = async () => {
    //   setIsLoading(true)


    //   const { data: { user }, error } = await supabase.auth.getUser();

    //   console.log({ user, error });


    //   if (error) {
    //     await signOut()
    //     navigate("/")
    //   }


    //  const userData =  await fetchUserProfile(user.id)

    //  console.log({userData});

    window.location.reload()

    //   if (!userData.role) {
    //     navigate('/role-selection');
    //   } else if (profile?.is_seller) {
    //     console.log("to seller dashboard", userData.role);

    //     navigate('/seller-dashboard');
    //   } else {
    //     console.log("to buyer dashboard", userData.role);
    //     navigate('/buyer-dashboard');
    //   }
  };

//   useEffect(() => {
//     async function initUserData() {
// console.log({location});

//       const { data: { user }, error } = await supabase.auth.getUser();

//       if (error) {
//         await signOut()
//         if (location.pathname !== "/") {
//           navigate("/")
//         }
//       }


//       const userData = await fetchUserProfile(user.id)


//       if (!userData.role) {
//         navigate('/role-selection');
//       } else if (profile?.is_seller) {
//         console.log("to seller dashboard", userData.role);

//         navigate('/seller-dashboard');
//       } else {
//         console.log("to buyer dashboard", userData.role);
//         navigate('/buyer-dashboard');
//       }
//     }

//     initUserData()
//   }, [])

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center animate-fade-in">
        <div className="glass-morphism max-w-md p-6 rounded-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="text-gradient">Meet'nMart Markets</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with local sellers through LIVE video
            </p>
          </div>

          <div className="grid gap-4">
            {!isAuthenticated && <SocialAuthButtons flow='login' providers={['google']} />}
            <Button disabled={isLoading}
              size="lg"
              onClick={handleGetStarted}
              className="bg-market-orange hover:bg-market-orange/90"
            >
              <ShoppingBasket className="mr-2 h-4 w-4" />
              {user ? 'Go to Dashboard' : 'Get Started'}
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
