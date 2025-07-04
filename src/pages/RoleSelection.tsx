import { useEffect, useState } from 'react';
import { Navigate, redirect, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cacheKeys, useUpdateUserRole } from '@/hooks/api-hooks';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfileStore } from '@/contexts/Store';

const RoleSelection = () => {
  const { user, updateOnboardingStep ,updateUserRole} = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | null>(null); // Default to seller
  const updateRoleMutation = useUpdateUserRole();
  const profileStore = useUserProfileStore()
  
  const setProfileData = useUserProfileStore(state => state.setProfileData);
  
  
  const handleConfirmSelection = async () => {
    if (!selectedRole) {
      toast.error('Please select a role before confirming.');
      return;
    }
    try {
      setIsLoading(true);
      await updateRoleMutation.mutateAsync({ 
        userId: user.id, 
        role: selectedRole 
      });

      // Update onboarding_step to 1
     await updateOnboardingStep(1)
     await updateUserRole(selectedRole)

      toast.success(`You're now set up as a ${selectedRole}!`);
      navigate("/interest-selection", { replace: true });

    } catch (error: any) {
      if (error?.message?.includes("duplicate key")) {
        toast.success(`You're now set up as a ${selectedRole}!`);
        setProfileData(prev => ({...prev, onboarding_step: 1}))
        navigate("/interest-selection", { replace: true });
        return;
      }

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

  // // Function to confirm role selection
  // const handleConfirmSelection = () => {
  //   handleRoleSelect(selectedRole);
  // };

  
//   useEffect(() => {
//     (async () => await queryClient.fetchQuery({ queryKey: cacheKeys.userProfile(user?.id) }))()
// }, [user])

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
          className={cn(
            "glass-morphism cursor-pointer transition-all duration-300 relative overflow-hidden",
            selectedRole === 'buyer'
              ? 'border-2 border-market-blue shadow-lg shadow-market-blue/20 scale-105 z-10'
              : 'hover:border-market-blue/50 hover:shadow-md'
          )}
          onClick={() => handleCardSelect('buyer')}
        >
          {selectedRole === 'buyer' && (
            <div className="absolute top-3 right-3 bg-market-blue rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          <CardContent className={cn(
            "p-8 flex flex-col items-center text-center",
            selectedRole === 'buyer' ? 'bg-market-blue/5' : ''
          )}>
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
              selectedRole === 'buyer'
                ? 'bg-market-blue/30'
                : 'bg-market-blue/20'
            )}>
              <ShoppingBag className={cn(
                "h-10 w-10 transition-all duration-300",
                selectedRole === 'buyer' ? 'text-market-blue scale-110' : 'text-market-blue'
              )} />
            </div>
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              selectedRole === 'buyer' ? 'text-market-blue' : ''
            )}>
              I want to Buy
            </h2>
            <p className="text-muted-foreground">
              Browse markets, connect with sellers, and make purchases through secure escrow.
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "glass-morphism cursor-pointer transition-all duration-300 relative overflow-hidden",
            selectedRole === 'seller'
              ? 'border-2 border-market-orange shadow-lg shadow-market-orange/20 scale-105 z-10'
              : 'hover:border-market-orange/50 hover:shadow-md'
          )}
          onClick={() => handleCardSelect('seller')}
        >
          {selectedRole === 'seller' && (
            <div className="absolute top-3 right-3 bg-market-orange rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}
          <CardContent className={cn(
            "p-8 flex flex-col items-center text-center",
            selectedRole === 'seller' ? 'bg-market-orange/5' : ''
          )}>
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
              selectedRole === 'seller'
                ? 'bg-market-orange/30'
                : 'bg-market-orange/20'
            )}>
              <User className={cn(
                "h-10 w-10 transition-all duration-300",
                selectedRole === 'seller' ? 'text-market-orange scale-110' : 'text-market-orange'
              )} />
            </div>
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              selectedRole === 'seller' ? 'text-market-orange' : ''
            )}>
              I want to Sell
            </h2>
            <p className="text-muted-foreground">
              Create a seller profile, showcase your products, and connect with buyers through video calls.
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        className={cn(
          "w-full max-w-md transition-all duration-300",
          selectedRole === 'buyer' ? 'bg-market-blue hover:bg-market-blue/90' : 'bg-market-orange hover:bg-market-orange/90'
        )}
        size="lg"
        disabled={isLoading}
        onClick={handleConfirmSelection}
      >
        {isLoading ? 'Setting up your account...' : `Continue as ${selectedRole === 'buyer' ? 'Buyer' : 'Seller'}`}
      </Button>
    </div>
  );
};

export default RoleSelection;
