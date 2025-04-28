
import { Home, Search, Bell, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
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
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center ${isActive('/profile') ? 'text-market-orange' : 'text-muted-foreground'}`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
