
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/markets');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section with Background */}
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1605810230434-7631ac76ec81)',
            filter: 'brightness(0.4)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gradient animate-fade-in">
            Market Meet Now
          </h1>
          <p className="text-lg text-gray-300 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Connect with local sellers in real-time
          </p>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 px-6 -mt-20 relative z-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass-morphism rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Your local marketplace in your pocket</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center">
              <span className="text-market-orange mr-2">✓</span>
              <span>Find local sellers with live availability</span>
            </li>
            <li className="flex items-center">
              <span className="text-market-orange mr-2">✓</span>
              <span>Connect through audio & video calls</span>
            </li>
            <li className="flex items-center">
              <span className="text-market-orange mr-2">✓</span>
              <span>Safe transactions with escrow payments</span>
            </li>
          </ul>
          <Button 
            onClick={() => setAuthModalOpen(true)}
            className="w-full bg-market-orange hover:bg-market-orange/90 font-medium"
          >
            Join Your Local Market
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      
      <AuthModal 
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onSuccess={handleLogin}
      />
    </div>
  );
};

export default Index;
