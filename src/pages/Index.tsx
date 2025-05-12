
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingBasket, PhoneCall, Star, Users, ShieldCheck, CheckCircle, Badge } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { SocialAuthButtons } from '@/components/SocialAuthButtons';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import Logo from '@/components/Logo';

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
    <div className="flex flex-col min-h-screen bg-background">
      <SEO
        title="MeetnMart - Connect with Local Sellers through Live Video"
        description="Shop locally and connect face-to-face with sellers through video calls. MeetnMart revolutionizes local commerce."
      />

      {/* Hero Section */}
      <main className="flex-grow flex flex-col animate-fade-in">
        <div className="px-4 pt-8 pb-12 md:pt-12 md:pb-16 max-w-md mx-auto w-full text-center">
          <div className="mb-6 relative">
           <div className="w-full flex items-center justify-center">
           <Logo />
           </div>
            <Badge className="ml-2 bg-background/50 absolute top-0 right-0 border-market-orange">Beta</Badge>
          </div>


          {/* Value Proposition */}
          <p className="text-lg text-muted-foreground mb-8">
            Connect with local sellers through live video calls before you buy
          </p>

          <div className="glass-morphism p-6 rounded-xl mb-8">
            <div className="grid gap-4">
              {!isAuthenticated &&
                (
                  <>
                    <SocialAuthButtons redirectTo={window.location.origin} flow='login' providers={['google']} />
                    <Button disabled={isLoading}
                      variant="outline"
                      onClick={() => setShowAuthModal(true)}
                      className="bg-secondary/50 border-none"
                    >
                      <PhoneCall className="mr-2 h-4 w-4" />
                      Continue with Phone
                    </Button>
                  </>
                )}


              <Button disabled={isLoading}
                size="lg"
                onClick={handleGetStarted}
                className="bg-market-orange hover:bg-market-orange/90"
              >
                <ShoppingBasket className="mr-2 h-4 w-4" />
                {user ? 'Browse Markets' : 'Get Started'}
              </Button>

              {
                isAuthenticated && (
                  <>
                    <Button disabled={isLoading}
                      variant="outline"
                      onClick={signOut}
                      className="bg-secondary/50 border-none"
                    >
                      Sign Out
                    </Button>

                  </>
                )}

            </div>

            <div className="mt-8 text-sm text-muted-foreground text-center">
              <p>Test credentials: +15086842093, OTP: 123456</p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="grid gap-4">
              <Card className="bg-secondary/30 border-secondary/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-market-orange/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-market-orange" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Find Local Sellers</h3>
                    <p className="text-sm text-muted-foreground">Browse markets near you</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-secondary/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-market-purple/10 p-2 rounded-full">
                    <PhoneCall className="h-5 w-5 text-market-purple" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Live Video Connection</h3>
                    <p className="text-sm text-muted-foreground">Video chat to see products live</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-secondary/10">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-market-green/10 p-2 rounded-full">
                    <ShieldCheck className="h-5 w-5 text-market-green" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">Secure Transactions</h3>
                    <p className="text-sm text-muted-foreground">Pay with confidence via escrow</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Testimonial/Social Proof */}
          <div className="mb-10 border border-market-orange rounded-md my-4 p-2">
            <div className="flex justify-center mb-2">
              <Star className="h-5 w-5 fill-market-orange text-market-orange" />
              <Star className="h-5 w-5 fill-market-orange text-market-orange" />
              <Star className="h-5 w-5 fill-market-orange text-market-orange" />
              <Star className="h-5 w-5 fill-market-orange text-market-orange" />
              <Star className="h-5 w-5 fill-market-orange text-market-orange" />
            </div>
            <p className="italic text-sm mb-2">"MeetnMart changed how I shop locally. Seeing items before meeting saved me so much time!"</p>
            <p className="text-xs text-muted-foreground">- Sarah K., Buyer</p>
          </div>

          {/* Benefits */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Why MeetnMart?</h2>
            <ul className="space-y-3 text-left">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-market-orange" />
                <span>See products live before meeting</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-market-orange" />
                <span>Connect with trusted local sellers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-market-orange" />
                <span>Secure transactions with escrow payments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-market-orange" />
                <span>Save time with virtual meetings first</span>
              </li>
            </ul>
          </div>

          {/* Final CTA */}
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="w-full bg-market-orange hover:bg-market-orange/90 mt-4"
          >
            {user ? 'Browse Markets Now' : 'Join MeetnMart Today'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          
          {/* Hero Tagline */}
          <h1 className="text-2xl font-bold pt-4">
          Meet Them, See It, Buy It
          </h1>
        </div>
      </main >

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-muted-foreground" >
        <p>© 2025 MeetnMart. All rights reserved.</p>
        <p className="mt-1">Connecting local buyers and sellers safely.</p>
      </footer>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </div >
  );
};

export default Index;
