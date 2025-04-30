
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RoleSelection = () => {
  const { user, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = async (role: 'buyer' | 'seller') => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Update user role in the database
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ 
          user_id: user.id, 
          role 
        });
      
      if (roleError) throw roleError;

      // Update profile with is_seller flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_seller: role === 'seller' 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
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

  return (
    <div className="app-container px-4 pt-12 animate-fade-in flex flex-col items-center">
      <div className="text-center mb-12 max-w-sm">
        <h1 className="text-2xl font-bold text-gradient mb-4">Choose Your Role</h1>
        <p className="text-muted-foreground">
          Select how you want to use MeetnMart. You can always change this later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <Card 
          className="glass-morphism hover:border-market-blue cursor-pointer transition-all"
          onClick={() => !isLoading && handleRoleSelect('buyer')}
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
          className="glass-morphism hover:border-market-orange cursor-pointer transition-all"
          onClick={() => !isLoading && handleRoleSelect('seller')}
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
    </div>
  );
};

export default RoleSelection;
