
import { useState } from 'react';
import { User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from 'sonner';

const user = {
  id: 's1',
  name: 'Maya Johnson',
  avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
  phoneNumber: '+1 (555) 123-4567',
  category: 'Food & Produce',
  description: 'Fresh local produce, fruits and vegetables.',
  isOnline: true,
  isSeller: true,
};

const recentCalls = [
  { id: 'c1', buyerName: 'John Smith', time: '2 hours ago', duration: '8:45', missed: false },
  { id: 'c2', buyerName: 'Sarah Wilson', time: 'Yesterday', duration: '12:32', missed: false },
  { id: 'c3', buyerName: 'Robert Lee', time: 'Yesterday', duration: '', missed: true },
];

const SellerDashboard = () => {
  const [isOnline, setIsOnline] = useState(user.isOnline);
  
  const handleToggleOnline = (checked: boolean) => {
    setIsOnline(checked);
    toast.success(checked ? 'You are now online!' : 'You are now offline');
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gradient">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your seller account</p>
      </header>
      
      <div className="glass-morphism rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <Avatar className="h-16 w-16 mr-4 border-2 border-market-orange/50">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : (
              <AvatarFallback className="bg-secondary text-foreground">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-lg font-medium">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.category}</p>
            <p className="text-xs text-market-blue">{user.phoneNumber}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Availability Status</h3>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'You are visible to buyers' : 'You are not visible to buyers'}
              </p>
            </div>
            <Switch 
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              className={isOnline ? 'bg-market-green' : undefined}
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium flex items-center mb-4">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Recent Activity
        </h2>
        
        <div className="space-y-3">
          {recentCalls.map(call => (
            <div
              key={call.id}
              className="glass-morphism rounded-lg p-3 flex items-center"
            >
              <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center mr-3">
                <User size={20} className="text-muted-foreground" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-sm">
                  {call.buyerName}
                  {call.missed && (
                    <span className="text-destructive text-xs ml-2">(Missed)</span>
                  )}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock size={12} className="mr-1" />
                  <span>{call.time}</span>
                  {call.duration && (
                    <span className="ml-2">{call.duration}</span>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-market-blue"
              >
                Details
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium flex items-center mb-4">
          <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
          Earnings Overview
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-morphism rounded-lg p-3 text-center">
            <div className="text-market-green text-xl font-bold">$254.65</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div className="glass-morphism rounded-lg p-3 text-center">
            <div className="text-market-blue text-xl font-bold">$1,245.00</div>
            <div className="text-xs text-muted-foreground">All Time</div>
          </div>
        </div>
      </div>
      
      <Button className="w-full mb-8 bg-market-orange hover:bg-market-orange/90">
        Edit Seller Profile
      </Button>
      
      <BottomNavigation />
    </div>
  );
};

export default SellerDashboard;
