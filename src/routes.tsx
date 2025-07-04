import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import AuthGaurd, { BuyerRoute, ProtectedRoute, RoleSelectionRoute, SellerRoute } from "./contexts/AuthGaurd";
import BottomNavigation from "./components/BottomNavigation";


import Search from "./pages/Search";
import Loader from "./components/ui/loader";
import FeedPage from "./pages/Feed";
import FeedDetails from "./pages/FeedDetail";
import InterestSelection from "./pages/InterestSelection";
import { ProtectedRouteV2, RoleSelectionRouteV2 } from "./contexts/AuthGuardV2";
import Withdrawal from "./pages/Withdrawal";
import SettingsPage from "./pages/Settings/Index";
import BuyerBasicProfileSettings from "./components/settings/BuyerBasicProfileSettings";
import { InterestsSelectionSettings } from "./components/settings/InterestsSelectionSettings";
import HelpSupport from "./pages/Settings/HelpSupport";
import PrivacyPolicy from "./pages/Legals/PrivacyPolicy";
import TermsOfService from "./pages/Legals/TermsOfService";
import RefundsPolicy from "./pages/Legals/ReturnsPolicy";
import CookiePolicy from "./pages/Legals/CookiePolicy";
import BasicProfileSettings from "./components/settings/BasicProfileSettings";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const CategorySelection = lazy(() => import("./pages/CategorySelection"));
const SellerSelection = lazy(() => import("./pages/SellerSelection"));
const RatingFeedback = lazy(() => import("./pages/RatingFeedback"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const RoleSelection = lazy(() => import("./pages/RoleSelection"));
const EditSellerProfile = lazy(() => import("./pages/EditSellerProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const EditBuyerProfile = lazy(() => import("./pages/EditBuyerProfile"));
const Activity = lazy(() => import("./pages/Activity"));
const RecentVisits = lazy(() => import("./pages/RecentVisits"));
const LiveCall_V2 = lazy(() => import("./pages/LiveCall").then(module => ({ default: module.LiveCall_V2 })));
const EntrySlides = lazy(() => import("./components/EntrySlides").then(module => ({ default: module.EntrySlides })));
const CallsList = lazy(() => import("./pages/CallsList"));
const MarketSelection = lazy(() => import("./pages/MarketSelection"));
const Transactions = lazy(() => import("./pages/Transaction"));
const BuyerLanding = lazy(() => import("./pages/BuyerLanding"));
const LocationUsagePage = lazy(() => import("./pages/learn-more/LocationUsage"));
const SellerCatalog = lazy(() => import("./pages/SellerCatalog"));

export const appRoutes: RouteObject[] = [
  // Guest Routes

  { path: "/", element: <Index /> },
  { path: "/getting-started", element: <Login /> },
  // { path: "/good-to-know", element: <EntrySlides />},
  { path: "/read-more/location-usage", element: <LocationUsagePage /> },
  { path: "/feeds/:feedId", element: <FeedDetails /> },

  // Legals
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-service", element: <TermsOfService /> },
  { path: "/returns-policy", element: <RefundsPolicy /> },
  { path: "/cookie-policy", element: <CookiePolicy /> },


  // Protected Routes (requires auth AND role)
  {
    element: <>
      <Suspense fallback={<Loader />}>
        <ProtectedRouteV2 />
      </Suspense>
      <BottomNavigation />
    </>,
    children: [
      { path: "/feeds", element: <FeedPage /> },

      { path: "/markets/:marketOrCategoryName?", element: <MarketSelection /> },
      { path: "/categories", element: <CategorySelection /> },

      { path: "/search", element: <Search /> },
      { path: "/activity", element: <Activity /> },
      { path: "/calls/:callId?", element: <LiveCall_V2 /> },

      { path: "/recent-visits", element: <RecentVisits /> },
      { path: "/transactions/:tx_id?", element: <Transactions /> },
      { path: "/recent-calls", element: <CallsList /> },

      { path: "/interest-selection", element: <InterestSelection /> },
      {
        path: "/settings/:role",
        element: <SettingsPage />,
        children: [
          { path: "basic-information", index: true, element: <BasicProfileSettings /> },
          { path: "interests", element: <InterestsSelectionSettings /> },
          { path: "help", element: <HelpSupport /> }
        ]
      },

      // Seller specific routes
      {
        element: <SellerRoute />,
        children: [
          // { path: "/seller/landing", element: <MarketSelection /> },
          // { path: "/seller/categories", element: <SellerCategorySelection /> },
          { path: "/seller-dashboard", element: <SellerDashboard /> },
          { path: "/edit-seller-profile", element: <EditSellerProfile /> },
          { path: "/catalog", element: <SellerCatalog /> },
          { path: "/withdrawals", element: <Withdrawal /> },
        ]
      },

      // Buyer specific routes
      {
        element: <BuyerRoute />,
        children: [
          { path: "/sellers/:market_name", element: <SellerSelection /> },
          // { path: "/categories", element: <CategorySelection /> },
          { path: "/rating", element: <RatingFeedback /> },

          // { path: "/buyer/landing", element: <BuyerLanding /> },
          { path: "/buyer-dashboard", element: <BuyerDashboard /> },
          { path: "/edit-buyer-profile", element: <EditBuyerProfile /> },
        ]
      },

      // Role Selection Route (protected but no role check)
      {
        element: <RoleSelectionRouteV2 />,
        children: [
          {
            path: "/role-selection",
            element: <RoleSelection />
          }
        ]
      },
    ]
  },

  // All Catch Route
  { path: "*", element: <NotFound /> },
];
