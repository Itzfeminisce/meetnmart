
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const RoleSelection = () => {
  const { user, fetchUserProfile, isAuthenticated, userRole} = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>('seller'); // Default to seller

  if(!isAuthenticated){
    return <Navigate to={"/"} />
  }

  if(isAuthenticated && userRole){
    return <Navigate to={"/markets"} />
  }

  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Update user role in the database
      const { updateUserRole } = useAuth();
      await updateUserRole(role);

      // Refresh the user profile
      await fetchUserProfile();

      toast.success(`You're now set up as a ${role}!`);

      // Redirect based on role
      navigate(role === 'buyer' ? '/buyer-dashboard' : '/seller-dashboard');

    } catch (error: any) {
      console.error('Error setting role:', error);
      toast.error('Failed to set your role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle card click to visually select role before confirming
  const handleCardSelect = (role: 'buyer' | 'seller') => {
    setSelectedRole(role);
  };

  // Function to confirm role selection
  const handleConfirmSelection = () => {
    handleRoleSelect(selectedRole);
  };

  return (
    <div className="app-container px-4 pt-12 animate-fade-in flex flex-col items-center">
      <div className="text-center mb-12 max-w-sm">
        <h1 className="text-2xl font-bold text-gradient mb-4">Choose Your Role</h1>
        <p className="text-muted-foreground">
          Select how you want to use MeetnMart. You can always change this later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
        <Card
          className={`glass-morphism hover:border-market-blue cursor-pointer transition-all ${
            selectedRole === 'buyer' ? 'border-2 border-market-blue' : ''
          }`}
          onClick={() => handleCardSelect('buyer')}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-market-blue/20 flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-market-blue" />
            </div>
            <h2 className="text-xl font-semibold mb-2">I want to Buy</h2>
            <p className="text-muted-foreground">
              Browse markets, connect with sellers, and make purchases through secure escrow.
            </p>
          </CardContent>
        </Card>

        <Card
          className={`glass-morphism hover:border-market-orange cursor-pointer transition-all ${
            selectedRole === 'seller' ? 'border-2 border-market-orange' : ''
          }`}
          onClick={() => handleCardSelect('seller')}
        >
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-market-orange/20 flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-market-orange" />
            </div>
            <h2 className="text-xl font-semibold mb-2">I want to Sell</h2>
            <p className="text-muted-foreground">
              Create a seller profile, showcase your products, and connect with buyers through video calls.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button 
        className="w-full max-w-md" 
        size="lg"
        disabled={isLoading} 
        onClick={handleConfirmSelection}
      >
        {isLoading ? 'Setting up your account...' : 'Continue'}
      </Button>
    </div>
  );
};

export default RoleSelection;
