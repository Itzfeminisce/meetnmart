import React, { useState, useRef, useEffect, memo, ReactNode } from 'react';
import { Search, Menu, ArrowLeft, Bell, Settings, User, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { DebouncedInput, DebouncedInputRef } from './ui/debounced-input';

// Search configuration type
interface SearchConfig {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  defaultValue?: string;
}

// Main header props interface with organized sections
interface HeaderProps {
  // ===== Core Content Props =====
  /** Main title of the header */
  title?: string;
  /** Subtitle or description text */
  subtitle?: string | ReactNode;

  // ===== Navigation Props =====
  /** Whether to show the back button */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onBackClick?: () => void;
  /** Whether to show the menu button */
  showMenuButton?: boolean;
  /** Callback when menu button is clicked */
  onMenuClick?: () => void;

  // ===== Search Configuration =====
  /** Search configuration object */
  search?: SearchConfig;
  /** Whether to show search on desktop view */
  showSearchOnDesktop?: boolean;
  /** Whether search input should be active by default */
  defaultSearchActive?: never;
  /** Controlled state for search active status */
  isSearchActive?: boolean;
  /** Callback when search active state changes */
  onSearchToggle?: (active: boolean) => void;

  // ===== Content Slots =====
  /** Content to render on the left side */
  leftContent?: React.ReactNode;
  /** Content to render on the right side */
  rightContent?: React.ReactNode;
  /** Content to render in the center */
  centerContent?: React.ReactNode;

  // ===== Layout Control =====
  /** Whether to render right content on a new line */
  rightContentOnNewLine?: boolean;

  // ===== Styling Props =====
  /** Additional className for the header */
  className?: string;
  /** Visual variant of the header */
  variant?: 'default' | 'minimal' | 'elevated';

  // ===== Scroll Behavior Props =====
  /** Whether to hide header on scroll down and show on scroll up */
  hideOnScroll?: boolean;
  /** Scroll threshold in pixels before hiding/showing header */
  scrollThreshold?: number;
}

const AppHeader: React.FC<HeaderProps> = ({
  title = "App Title",
  subtitle,
  search,
  showSearchOnDesktop = true,
  showBackButton = false,
  onBackClick,
  showMenuButton = false,
  onMenuClick,
  leftContent,
  rightContent,
  centerContent,
  className = "",
  variant = 'default',
  isSearchActive: controlledSearchActive,
  onSearchToggle,
  rightContentOnNewLine = false,
  defaultSearchActive = false,
  hideOnScroll = true,
  scrollThreshold = 10
}) => {
  const [internalSearchActive, setInternalSearchActive] = useState(defaultSearchActive);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const searchInputRef = useRef<DebouncedInputRef>(null);

  const isSearchActive = controlledSearchActive !== undefined ? controlledSearchActive : internalSearchActive;

  const toggleSearch = () => {
    const newState = !isSearchActive;
    if (onSearchToggle) {
      onSearchToggle(newState);
    } else {
      setInternalSearchActive(newState);
    }
  };

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  // Scroll behavior effect
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't hide header if we're at the top of the page
      if (currentScrollY < scrollThreshold) {
        setIsHeaderVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Calculate scroll direction
      const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only change visibility if scroll difference exceeds threshold
      if (scrollDifference > scrollThreshold) {
        if (scrollDirection === 'down' && isHeaderVisible) {
          setIsHeaderVisible(false);
        } else if (scrollDirection === 'up' && !isHeaderVisible) {
          setIsHeaderVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [hideOnScroll, scrollThreshold, lastScrollY, isHeaderVisible]);

  // Force show header when search is active
  useEffect(() => {
    if (isSearchActive) {
      setIsHeaderVisible(true);
    }
  }, [isSearchActive]);

  const handleClearSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.clear();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-background border-0 shadow-none';
      case 'elevated':
        return 'bg-background shadow-md border-b';
      default:
        return 'bg-background border-b';
    }
  };

  const getScrollAnimationStyles = () => {
    if (!hideOnScroll) return '';
    
    return isHeaderVisible 
      ? 'translate-y-0 opacity-100' 
      : '-translate-y-full opacity-0';
  };

  const renderSearchInput = (isMobile = false) => (
    <div className="relative flex-1">
      <DebouncedInput
        ref={searchInputRef}
        placeholder={search?.placeholder || "Search..."}
        onChangeText={search?.onSearch || (() => { })}
        defaultValue={search?.defaultValue}
        isMobile={isMobile}
      />
      {searchInputRef.current && searchInputRef.current?.getQuery().length > 1 && (
        <button
          onClick={handleClearSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 ease-in-out mb-4",
        getVariantStyles(),
        getScrollAnimationStyles(),
        className
      )}
    >
      <div className="px-4 py-3 container">
        <div className="flex flex-col">
          <div className={cn("flex items-center justify-between", isSearchActive && "md:flex hidden")}>
            {!showBackButton && <div className="w-14 h-14 overflow-hidden">
              <img src='/logo-white.png' width={"100%"} className='object-cover h-full w-full' />
            </div>}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {leftContent ? (
                leftContent
              ) : (
                <>
                  {showBackButton && (
                    <button
                      onClick={onBackClick}
                      className="flex-shrink-0 p-2 rounded-full hover:bg-accent transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}

                  {showMenuButton && (
                    <button
                      onClick={onMenuClick}
                      className="flex-shrink-0 p-2 rounded-full hover:bg-accent transition-colors"
                    >
                      <Menu className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              {!isSearchActive && (
                <div className="min-w-0 flex-1 overflow-hidden">
                  {centerContent ? (
                    centerContent
                  ) : (
                    <div className="overflow-hidden">
                      <h1 className="text-lg md:text-2xl font-semibold truncate">
                        {title}
                      </h1>
                      {subtitle && (
                        <div className="text-sm md:text-base text-muted-foreground truncate">
                          {subtitle}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {search && showSearchOnDesktop && !isSearchActive && (
                <div className="hidden md:flex flex-1 max-w-md mx-4">
                  {renderSearchInput()}
                </div>
              )}

              <div className="flex items-center space-x-2 flex-shrink-0">
                {search && (
                  <button
                    onClick={toggleSearch}
                    className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
                  >
                    {isSearchActive ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </button>
                )}

                {!rightContentOnNewLine && rightContent && !isSearchActive && (
                  <div className="flex items-center space-x-2">
                    {rightContent}
                  </div>
                )}
              </div>
            </div>
          </div>

          {(rightContentOnNewLine || isSearchActive) && rightContent && !isSearchActive && (
            <div className={cn("mt-4", rightContentOnNewLine && "md:mt-4")}>
              {rightContent}
            </div>
          )}
        </div>
      </div>

      {search && isSearchActive && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center">
            {renderSearchInput(true)}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-full hover:bg-accent transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default memo(AppHeader)
// import React, { useState, useRef, useEffect, memo, ReactNode } from 'react';
// import { Search, Menu, ArrowLeft, Bell, Settings, User, X } from 'lucide-react';
// import { cn } from "@/lib/utils";
// import { Input } from './ui/input';
// import { Button } from './ui/button';
// import { DebouncedInput, DebouncedInputRef } from './ui/debounced-input';

// // Search configuration type
// interface SearchConfig {
//   placeholder?: string;
//   onSearch?: (query: string) => void;
//   onClear?: () => void;
//   defaultValue?: string;
// }

// // Main header props interface with organized sections
// interface HeaderProps {
//   // ===== Core Content Props =====
//   /** Main title of the header */
//   title?: string;
//   /** Subtitle or description text */
//   subtitle?: string | ReactNode;

//   // ===== Navigation Props =====
//   /** Whether to show the back button */
//   showBackButton?: boolean;
//   /** Callback when back button is clicked */
//   onBackClick?: () => void;
//   /** Whether to show the menu button */
//   showMenuButton?: boolean;
//   /** Callback when menu button is clicked */
//   onMenuClick?: () => void;

//   // ===== Search Configuration =====
//   /** Search configuration object */
//   search?: SearchConfig;
//   /** Whether to show search on desktop view */
//   showSearchOnDesktop?: boolean;
//   /** Whether search input should be active by default */
//   defaultSearchActive?: never;
//   /** Controlled state for search active status */
//   isSearchActive?: boolean;
//   /** Callback when search active state changes */
//   onSearchToggle?: (active: boolean) => void;

//   // ===== Content Slots =====
//   /** Content to render on the left side */
//   leftContent?: React.ReactNode;
//   /** Content to render on the right side */
//   rightContent?: React.ReactNode;
//   /** Content to render in the center */
//   centerContent?: React.ReactNode;

//   // ===== Layout Control =====
//   /** Whether to render right content on a new line */
//   rightContentOnNewLine?: boolean;

//   // ===== Styling Props =====
//   /** Additional className for the header */
//   className?: string;
//   /** Visual variant of the header */
//   variant?: 'default' | 'minimal' | 'elevated';
// }

// const AppHeader: React.FC<HeaderProps> = ({
//   title = "App Title",
//   subtitle,
//   search,
//   showSearchOnDesktop = true,
//   showBackButton = false,
//   onBackClick,
//   showMenuButton = false,
//   onMenuClick,
//   leftContent,
//   rightContent,
//   centerContent,
//   className = "",
//   variant = 'default',
//   isSearchActive: controlledSearchActive,
//   onSearchToggle,
//   rightContentOnNewLine = false,
//   defaultSearchActive = false
// }) => {
//   const [internalSearchActive, setInternalSearchActive] = useState(defaultSearchActive);
//   const searchInputRef = useRef<DebouncedInputRef>(null);

//   const isSearchActive = controlledSearchActive !== undefined ? controlledSearchActive : internalSearchActive;

//   const toggleSearch = () => {
//     const newState = !isSearchActive;
//     if (onSearchToggle) {
//       onSearchToggle(newState);
//     } else {
//       setInternalSearchActive(newState);
//     }
//   };

//   useEffect(() => {
//     if (isSearchActive && searchInputRef.current) {
//       searchInputRef.current.focus();
//     }
//   }, [isSearchActive]);

//   const handleClearSearch = () => {
//     if (searchInputRef.current) {
//       searchInputRef.current.clear();
//     }
//   };

//   const getVariantStyles = () => {
//     switch (variant) {
//       case 'minimal':
//         return 'bg-background border-0 shadow-none';
//       case 'elevated':
//         return 'bg-background shadow-md border-b';
//       default:
//         return 'bg-background border-b';
//     }
//   };

//   const renderSearchInput = (isMobile = false) => (
//     <div className="relative flex-1">
//       <DebouncedInput
//         ref={searchInputRef}
//         placeholder={search?.placeholder || "Search..."}
//         onChangeText={search?.onSearch || (() => { })}
//         defaultValue={search?.defaultValue}
//         isMobile={isMobile}
//       />
//       {searchInputRef.current && searchInputRef.current?.getQuery().length > 1 && (
//         <button
//           onClick={handleClearSearch}
//           className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-accent transition-colors"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       )}
//     </div>
//   );

//   return (
//     <header className={cn("sticky top-0 z-50 transition-all duration-300 mb-4", getVariantStyles(), className)}>


//       <div className="px-4 py-3 container">
//         <div className="flex flex-col">
//           <div className={cn("flex items-center justify-between", isSearchActive && "md:flex hidden")}>
//             {!showBackButton && <div className="w-14 h-14 overflow-hidden">
//               <img src='/logo-white.png' width={"100%"} className='object-cover h-full w-full' />
//             </div>}
//             <div className="flex items-center space-x-3 flex-1 min-w-0">
//               {leftContent ? (
//                 leftContent
//               ) : (
//                 <>
//                   {showBackButton && (
//                     <button
//                       onClick={onBackClick}
//                       className="flex-shrink-0 p-2 rounded-full hover:bg-accent transition-colors"
//                     >
//                       <ArrowLeft className="w-5 h-5" />
//                     </button>
//                   )}

//                   {showMenuButton && (
//                     <button
//                       onClick={onMenuClick}
//                       className="flex-shrink-0 p-2 rounded-full hover:bg-accent transition-colors"
//                     >
//                       <Menu className="w-5 h-5" />
//                     </button>
//                   )}
//                 </>
//               )}

//               {!isSearchActive && (
//                 <div className="min-w-0 flex-1 overflow-hidden">
//                   {centerContent ? (
//                     centerContent
//                   ) : (
//                     <div className="overflow-hidden">
//                       <h1 className="text-lg md:text-2xl font-semibold truncate">
//                         {title}
//                       </h1>
//                       {subtitle && (
//                         <div className="text-sm md:text-base text-muted-foreground truncate">
//                           {subtitle}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {search && showSearchOnDesktop && !isSearchActive && (
//                 <div className="hidden md:flex flex-1 max-w-md mx-4">
//                   {renderSearchInput()}
//                 </div>
//               )}

//               <div className="flex items-center space-x-2 flex-shrink-0">
//                 {search && (
//                   <button
//                     onClick={toggleSearch}
//                     className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
//                   >
//                     {isSearchActive ? (
//                       <X className="w-5 h-5" />
//                     ) : (
//                       <Search className="w-5 h-5" />
//                     )}
//                   </button>
//                 )}

//                 {!rightContentOnNewLine && rightContent && !isSearchActive && (
//                   <div className="flex items-center space-x-2">
//                     {rightContent}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {(rightContentOnNewLine || isSearchActive) && rightContent && !isSearchActive && (
//             <div className={cn("mt-4", rightContentOnNewLine && "md:mt-4")}>
//               {rightContent}
//             </div>
//           )}
//         </div>
//       </div>

//       {search && isSearchActive && (
//         <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
//           <div className="flex items-center">
//             {renderSearchInput(true)}
//             <button
//               onClick={toggleSearch}
//               className="p-2 rounded-full hover:bg-accent transition-colors ml-2"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       )}
//     </header>
//   );
// };

// export default memo(AppHeader)
