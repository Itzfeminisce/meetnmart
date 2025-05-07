
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showSignIn?: boolean;
}

const UserAvatar = ({ size = 'md', showSignIn = true }: UserAvatarProps) => {
  const { user, profile, userRole } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const handleAuthSuccess = () => {
    // Check user role to determine where to navigate
    if (!userRole) {
      navigate('/role-selection');
    } else if (userRole === 'seller') {
      navigate('/seller-dashboard');
    } else {
      navigate('/buyer-dashboard');
    }
  };

  const handleAvatarClick = () => {
    if (user) {
      if (!userRole) {
        navigate('/role-selection');
      } else if (userRole === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    }
  };

  if (!user && !showSignIn) {
    return null;
  }

  return (
    <>
      {user ? (
        <Avatar 
          className={`${sizeClass[size]} border-2 border-secondary cursor-pointer`}
          onClick={handleAvatarClick}
        >
          {profile?.avatar ? (
            <AvatarImage src={profile.avatar} alt={profile?.name || 'User'} />
          ) : (
            <AvatarFallback className="bg-secondary text-foreground">
              {getInitials(profile?.name)}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowAuthModal(true)}
          className="bg-secondary/50 border-none"
        >
          <User size={16} className="mr-2" />
          Sign In
        </Button>
      )}

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default UserAvatar;
