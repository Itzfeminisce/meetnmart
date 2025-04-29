
import { Home, Search, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/seller-dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    navigate('/seller-dashboard');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-card glass-morphism border-t border-border shadow-lg z-50">
        <div className="grid grid-cols-4 h-full max-w-md mx-auto">
          <button 
            onClick={() => navigate('/markets')}
            className={`flex flex-col items-center justify-center ${isActive('/markets') ? 'text-market-orange' : 'text-muted-foreground'}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Markets</span>
          </button>

          <button 
            onClick={() => navigate('/explore')}
            className={`flex flex-col items-center justify-center ${isActive('/explore') ? 'text-market-orange' : 'text-muted-foreground'}`}
          >
            <Search size={20} />
            <span className="text-xs mt-1">Explore</span>
          </button>

          <button 
            onClick={() => navigate('/activity')}
            className={`flex flex-col items-center justify-center ${isActive('/activity') ? 'text-market-orange' : 'text-muted-foreground'}`}
          >
            <Bell size={20} />
            <span className="text-xs mt-1">Activity</span>
          </button>

          <button 
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center ${
              isActive('/seller-dashboard') || isActive('/profile') ? 'text-market-orange' : 'text-muted-foreground'
            }`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
      
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default BottomNavigation;
