import { Home, Search, Bell, User, Grid2X2Icon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import AuthModal from "./AuthModal";
import Whispa from "./Whispa";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userDashboardUrl = `/${userRole}-dashboard`
  const userHomeUrl = `/feeds`

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      // Set scrolling state to true
      setIsScrolling(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set timeout to reset scrolling state after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 700); // Adjust delay as needed (150ms works well)
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (/^\/(calls|good-to-know|role-selection)$/.test(location.pathname)) return null

  return (
    <>
      <div 
        className={`
          fixed bottom-0 left-0 right-0 h-16 bg-card glass-morphism border-t border-border shadow-lg z-50
          transition-opacity duration-200 ease-out
          ${isScrolling ? 'opacity-60' : 'opacity-100'}
        `}
      >
        <div className="grid grid-cols-5 h-full max-w-md mx-auto relative">
          <button
            onClick={() => navigate(userHomeUrl)}
            className={`flex flex-col items-center justify-center transition-colors duration-200 ${
              isActive(userHomeUrl) ? 'text-market-orange' : 'text-muted-foreground'
            }`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Feeds</span>
          </button>

          <button
            onClick={() => navigate('/search')}
            className={`flex flex-col items-center justify-center transition-colors duration-200 ${
              isActive('/search') ? 'text-market-orange' : 'text-muted-foreground'
            }`}
          >
            <Search size={20} />
            <span className="text-xs mt-1">Search</span>
          </button>

          {/* Whispa Container - Only visible on mobile */}
          <div className="md:hidden flex items-center justify-center">
            <div className={`
              relative -mt-5 transition-all duration-200 ease-out
              ${isScrolling ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}
            `}>
              <Whispa isInNav={true} />
            </div>
          </div>

          {userRole === "buyer" && (
            <button
              onClick={() => navigate('/history')}
              className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                isActive('/history') ? 'text-market-orange' : 'text-muted-foreground'
              }`}
            >
              <Bell size={20} />
              <span className="text-xs mt-1">History</span>
            </button>
          )}
          {
            userRole === "seller" && (
              <button
                onClick={() => navigate('/catalog')}
                className={`flex flex-col items-center justify-center transition-colors duration-200 ${
                  isActive('/catalog') ? 'text-market-orange' : 'text-muted-foreground'
                }`}
              >
                <Grid2X2Icon size={20} />
                <span className="text-xs mt-1">Catalog</span>
              </button>
            )
          }

          <button
            onClick={() => navigate(userDashboardUrl)}
            className={`flex flex-col items-center justify-center transition-colors duration-200 ${
              isActive('/seller-dashboard') || isActive('/buyer-dashboard') || isActive('/profile') || isActive('/role-selection')
                ? 'text-market-orange'
                : 'text-muted-foreground'
            }`}
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {/* Whispa - Only visible on desktop */}
      <div className="hidden md:block">
        <Whispa isInNav={false} />
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={() => navigate(userHomeUrl)}
      />
    </>
  );
};

export default BottomNavigation;
// import { Home, Search, Bell, User, Grid2X2Icon } from "lucide-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { useState } from "react";
// import AuthModal from "./AuthModal";
// import Whispa from "./Whispa";

// const BottomNavigation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { userRole } = useAuth();
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   const userDashboardUrl = `/${userRole}-dashboard`
//   const userHomeUrl = `/feeds`

//   const isActive = (path: string) => {
//     return location.pathname === path;
//   };

//   if (/^\/(calls|good-to-know|role-selection)$/.test(location.pathname)) return null

//   return (
//     <>
//       <div className="fixed bottom-0 left-0 right-0 h-16 bg-card glass-morphism border-t border-border shadow-lg z-50">
//         <div className="grid grid-cols-5 h-full max-w-md mx-auto relative">
//           <button
//             onClick={() => navigate(userHomeUrl)}
//             className={`flex flex-col items-center justify-center ${isActive(userHomeUrl) ? 'text-market-orange' : 'text-muted-foreground'}`}
//           >
//             <Home size={20} />
//             <span className="text-xs mt-1">Feeds</span>
//           </button>

//           <button
//             onClick={() => navigate('/search')}
//             className={`flex flex-col items-center justify-center ${isActive('/search') ? 'text-market-orange' : 'text-muted-foreground'}`}
//           >
//             <Search size={20} />
//             <span className="text-xs mt-1">Search</span>
//           </button>

//           {/* Whispa Container - Only visible on mobile */}
//           <div className="md:hidden flex items-center justify-center">
//             <div className="relative -mt-5">
//               <Whispa isInNav={true} />
//             </div>
//           </div>

//           {userRole === "buyer" && (
//             <button
//               onClick={() => navigate('/history')}
//               className={`flex flex-col items-center justify-center ${isActive('/history') ? 'text-market-orange' : 'text-muted-foreground'}`}
//             >
//               <Bell size={20} />
//               <span className="text-xs mt-1">History</span>
//             </button>
//           )}
//           {
//             userRole === "seller" && (
//               <button
//                 onClick={() => navigate('/catalog')}
//                 className={`flex flex-col items-center justify-center ${isActive('/catalog') ? 'text-market-orange' : 'text-muted-foreground'}`}
//               >
//                 <Grid2X2Icon size={20} />
//                 <span className="text-xs mt-1">Catalog</span>
//               </button>
//             )
//           }

//           <button
//             onClick={() => navigate(userDashboardUrl)}
//             className={`flex flex-col items-center justify-center ${isActive('/seller-dashboard') || isActive('/buyer-dashboard') || isActive('/profile') || isActive('/role-selection')
//               ? 'text-market-orange'
//               : 'text-muted-foreground'
//               }`}
//           >
//             <User size={20} />
//             <span className="text-xs mt-1">Profile</span>
//           </button>
//         </div>
//       </div>

//       {/* Whispa - Only visible on desktop */}
//       <div className="hidden md:block">
//         <Whispa isInNav={false} />
//       </div>

//       <AuthModal
//         open={showAuthModal}
//         onOpenChange={setShowAuthModal}
//         onSuccess={() => navigate(userHomeUrl)}
//       />
//     </>
//   );
// };

// export default BottomNavigation;
