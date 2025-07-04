import { Home, Search, Bell, User, Grid2X2Icon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import AuthModal from "./AuthModal";
import Whispa from "./Whispa";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUserProfileStore } from "@/contexts/Store";
import { useAuthV2 } from "../contexts/AuthContextV2";

// Memoized navigation button component
const NavButton = memo(({
  onClick,
  isActive,
  icon: Icon,
  label,
  badge,
  size = 20,
}: {
  onClick: () => void;
  isActive: boolean;
  icon: any;
  label: string;
  size?: number;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center transition-colors duration-200 relative ${isActive ? 'text-market-orange' : 'text-muted-foreground'
      }`}
  >
    <Icon size={size} />
    <span className="text-xs mt-1">{label}</span>
    {badge && (<span className="absolute top-2 md:top-2 right-4 md:right-7 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>)}
  </button>
));

NavButton.displayName = 'NavButton';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading } = useAuthV2();
  const isMobile = useIsMobile()
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const profile = useUserProfileStore(ctx => ctx.data)

  // Memoize URLs to prevent unnecessary re-renders
  const userDashboardUrl = useMemo(() => `/${profile?.role}-dashboard`, [profile]);
  const userHomeUrl = '/feeds'
  
  // Memoize navigation handlers
  const navigateToHome = useCallback(() => navigate(userHomeUrl), [location, ]);
  const navigateToSearch = useCallback(() => navigate('/search'), [location]);
  const navigateToHistory = useCallback(() => navigate('/activity'), [location]);
  const navigateToCatalog = useCallback(() => navigate('/catalog'), [location]);
  const navigateToProfile = useCallback(() => navigate(userDashboardUrl), [location, ]);
  
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname, navigate]);

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
    return /^\/(calls|good-to-know|settings.+|interest-selection|role-selection|recent-calls|markets|sellers.+|rating|categories)$/.test(location.pathname);
  }, [location.pathname]);

  // Memoize active states
  const activeStates = useMemo(() => ({
    home: isActive(userHomeUrl),
    search: isActive('/search'),
    activity: isActive('/activity'),
    catalog: isActive('/catalog'),
    profile: isActive(userDashboardUrl)
  }), [isActive,userHomeUrl, profile, userDashboardUrl]);

  // Memoize conditional navigation items
  const conditionalNavItem = useMemo(() => {
    const navItems = [
      <NavButton
        badge={2}
        onClick={navigateToHistory}
        isActive={activeStates.activity}
        icon={Bell}
        label="Activity"
      />
    ]


    if (profile?.role === "seller" && !isMobile) {
      navItems.push(
        <NavButton
              onClick={navigateToCatalog}
              isActive={activeStates.catalog}
              icon={Grid2X2Icon}
              label="Catalog"
            />
      )
    }
    return navItems;
  }, [activeStates,  isMobile]);

 
  // Early return if navigation should be hidden
  if (shouldHideNavigation) return null;

  
  // useEffect(() => {
  //   if (profile) {
  //     profileStore.setProfileData(profile)
  //   }
  // }, [profile])


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
          <div className="md:hidden flex items-center justify-center -mt-5">
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