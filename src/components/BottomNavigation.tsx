import { Home, Search, Bell, User, Grid2X2Icon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import AuthModal from "./AuthModal";
import Whispa from "./Whispa";

// Memoized navigation button component
const NavButton = memo(({ 
  onClick, 
  isActive, 
  icon: Icon, 
  label, 
  size = 20 
}: {
  onClick: () => void;
  isActive: boolean;
  icon: any;
  label: string;
  size?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center transition-colors duration-200 ${
      isActive ? 'text-market-orange' : 'text-muted-foreground'
    }`}
  >
    <Icon size={size} />
    <span className="text-xs mt-1">{label}</span>
  </button>
));

NavButton.displayName = 'NavButton';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize URLs to prevent unnecessary re-renders
  const userDashboardUrl = useMemo(() => `/${userRole}-dashboard`, [userRole]);
  const userHomeUrl = useMemo(() => `/feeds`, []);

  // Memoize navigation handlers
  const navigateToHome = useCallback(() => navigate(userHomeUrl), [navigate, userHomeUrl]);
  const navigateToSearch = useCallback(() => navigate('/search'), [navigate]);
  const navigateToHistory = useCallback(() => navigate('/history'), [navigate]);
  const navigateToCatalog = useCallback(() => navigate('/catalog'), [navigate]);
  const navigateToProfile = useCallback(() => navigate(userDashboardUrl), [navigate, userDashboardUrl]);

  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Optimized scroll detection with throttling
  const handleScroll = useCallback(() => {
    // Set scrolling state to true
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set timeout to reset scrolling state after scroll stops
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 700);
  }, []);

  // Scroll detection effect with cleanup
  useEffect(() => {
    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Memoize the check for hiding the navigation
  const shouldHideNavigation = useMemo(() => {
    return /^\/(calls|good-to-know|role-selection|recent-calls|markets|sellers.+|rating)$/.test(location.pathname);
  }, [location.pathname]);

  // Memoize active states
  const activeStates = useMemo(() => ({
    home: isActive(userHomeUrl),
    search: isActive('/search'),
    history: isActive('/history'),
    catalog: isActive('/catalog'),
    profile: isActive('/seller-dashboard') || 
             isActive('/buyer-dashboard') || 
             isActive('/profile') || 
             isActive('/role-selection')
  }), [isActive, userHomeUrl]);

  // Memoize conditional navigation items
  const conditionalNavItem = useMemo(() => {
    if (userRole === "buyer") {
      return (
        <NavButton
          onClick={navigateToHistory}
          isActive={activeStates.history}
          icon={Bell}
          label="History"
        />
      );
    }
    
    if (userRole === "seller") {
      return (
        <NavButton
          onClick={navigateToCatalog}
          isActive={activeStates.catalog}
          icon={Grid2X2Icon}
          label="Catalog"
        />
      );
    }
    
    return null;
  }, [userRole, navigateToHistory, navigateToCatalog, activeStates.history, activeStates.catalog]);

  // Memoize Whispa scroll styles
  // const whispaScrollStyles = useMemo(() => ({
  //   transform: isScrolling ? 'scale(0.95)' : 'scale(1)',
  //   opacity: isScrolling ? 0.8 : 1
  // }), [isScrolling]);

  // Early return if navigation should be hidden
  if (shouldHideNavigation) return null;

  return (
    <>
      <div 
        className={`
          fixed bottom-0 left-0 right-0 h-16 bg-card glass-morphism border-t border-border shadow-lg z-50
          transition-opacity duration-200 ease-out
        `}
        style={{ opacity: isScrolling ? 0.6 : 1 }}
      >
        <div className="grid grid-cols-5 h-full max-w-md mx-auto relative">
          <NavButton
            onClick={navigateToHome}
            isActive={activeStates.home}
            icon={Home}
            label="Feeds"
          />

          <NavButton
            onClick={navigateToSearch}
            isActive={activeStates.search}
            icon={Search}
            label="Search"
          />

          {/* Whispa Container - Only visible on mobile */}
          <div className="md:hidden flex items-center justify-center">
            {/* <div 
              className="relative -mt-5 transition-all duration-200 ease-out"
              style={whispaScrollStyles}
            > */}
              <Whispa isInNav={true} />
            {/* </div> */}
          </div>

          {conditionalNavItem}

          <NavButton
            onClick={navigateToProfile}
            isActive={activeStates.profile}
            icon={User}
            label="Profile"
          />
        </div>
      </div>

      {/* Whispa - Only visible on desktop */}
      <div className="hidden md:block">
        <Whispa isInNav={false} />
      </div>

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSuccess={navigateToHome}
      />
    </>
  );
};

export default memo(BottomNavigation);