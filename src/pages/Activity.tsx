import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ActivityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';

const Activity = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 -ml-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">Activity</h1>
        </div>
        <p className="text-muted-foreground">Track your shopping history</p>
      </header>
      
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-market-orange/10 p-4">
              <ActivityIcon size={48} className="text-market-orange" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold mb-3">Coming Soon</h2>
          
          <p className="text-muted-foreground mb-6">
            We're working on a new way to track your shopping history, saved items, and market activity.
            Soon you'll be able to see your recent purchases and favorite products all in one place.
          </p>
          
          <div className="glass-morphism p-4 rounded-lg">
            <p className="text-sm">
              <span className="font-medium">What to expect:</span> Shopping history, saved products, 
              spending insights, and personalized activity stats to help optimize your shopping experience.
            </p>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Activity;