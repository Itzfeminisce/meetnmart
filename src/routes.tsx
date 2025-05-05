
// routes.ts
import Index from "./pages/Index";
import MarketSelection from "./pages/MarketSelection";
import CategorySelection from "./pages/CategorySelection";
import SellersList from "./pages/SellersList";
import LiveCall from "./pages/LiveCall";
import RatingFeedback from "./pages/RatingFeedback";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import RoleSelection from "./pages/RoleSelection";
import EditSellerProfile from "./pages/EditSellerProfile";
import NotFound from "./pages/NotFound";
import { RouteObject } from "react-router-dom";
import AuthGaurd from "./contexts/AuthGaurd";
import EditBuyerProfile from "./pages/EditBuyerProfile";
import Explore from "./pages/Explore";
import Activity from "./pages/Activity";
import BottomNavigation from "./components/BottomNavigation";
import RecentVisits from "./pages/RecentVisits";

export const appRoutes: RouteObject[] = [

  // Guest Routes
  { path: "/", element: <Index /> },
  { path: "/role-selection", element: <RoleSelection /> },

  // Protected Routes
  {
    element: <>
      <AuthGaurd />
      <BottomNavigation />
    </>, children: [
      { path: "/markets", element: <MarketSelection /> },
      { path: "/categories", element: <CategorySelection /> },
      { path: "/sellers", element: <SellersList /> },
      { path: "/explore", element: <Explore /> },
      { path: "/activity", element: <Activity /> },
      { path: "/call", element: <LiveCall /> },
      { path: "/rating", element: <RatingFeedback /> },
      { path: "/seller-dashboard", element: <SellerDashboard /> },
      { path: "/buyer-dashboard", element: <BuyerDashboard /> },
      { path: "/edit-seller-profile", element: <EditSellerProfile /> },
      { path: "/edit-buyer-profile", element: <EditBuyerProfile /> },
      { path: "/recent-visits", element: <RecentVisits /> },
    ]
  },

  // All Catch Route
  { path: "*", element: <NotFound /> },
];
