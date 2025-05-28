import Index from "./pages/Index";
import MarketSelection from "./pages/BuyerLanding";
import CategorySelection from "./pages/CategorySelection";
import SellersList from "./pages/SellersList";
import RatingFeedback from "./pages/RatingFeedback";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import RoleSelection from "./pages/RoleSelection";
import EditSellerProfile from "./pages/EditSellerProfile";
import NotFound from "./pages/NotFound";
import { RouteObject } from "react-router-dom";
import AuthGaurd, { BuyerRoute, RoleSelectionRoute, SellerRoute } from "./contexts/AuthGaurd";
import EditBuyerProfile from "./pages/EditBuyerProfile";
import Explore from "./pages/Explore";
import Activity from "./pages/Activity";
import BottomNavigation from "./components/BottomNavigation";
import RecentVisits from "./pages/RecentVisits";
import { LiveCall_V2 } from "./pages/LiveCall";
import {EntrySlides} from "./components/EntrySlides";
import CallsList from "./pages/CallsList";
import SellerCategorySelection from "./pages/_SellerCategorySelection";
import SellerLanding from "./pages/SellerLanding";
import SellerSetup from "./pages/SellerSetup";
import Transactions from "./pages/Transaction";
import BuyerLanding from "./pages/BuyerLanding";

export const appRoutes: RouteObject[] = [
  // Guest Routes
  { path: "/", element: <Index /> },
  { path: "/good-to-know", element: <EntrySlides />},



  // Protected Routes (requires auth AND role)
  {
    element: <>
      <AuthGaurd requiresRole={true} requiresAuth={true} />
      <BottomNavigation />
    </>,
    children: [

      { path: "/explore", element: <Explore /> },
      { path: "/activity", element: <Activity /> },
      { path: "/calls/:callId?", element: <LiveCall_V2 /> },
      
      { path: "/recent-visits", element: <RecentVisits /> },
      { path: "/transactions/:tx_id?", element: <Transactions /> },
      { path: "/recent-calls", element: <CallsList /> },

      
      // Seller specific routes
      {
        element: <SellerRoute />,
        children: [
          { path: "/seller/landing", element: <SellerLanding /> },
          { path: "/seller/setup", element: <SellerSetup /> },
          { path: "/seller/categories", element: <SellerCategorySelection /> },
          { path: "/seller-dashboard", element: <SellerDashboard /> },
          { path: "/edit-seller-profile", element: <EditSellerProfile /> },
        ]
      },

      // Buyer specific routes
      {
        element: <BuyerRoute />,
        children: [
          { path: "/sellers", element: <SellersList /> },
          { path: "/categories", element: <CategorySelection /> },
          { path: "/rating", element: <RatingFeedback /> },

          { path: "/buyer/landing", element: <BuyerLanding /> },
          { path: "/buyer-dashboard", element: <BuyerDashboard /> },
          { path: "/edit-buyer-profile", element: <EditBuyerProfile /> },
        ]
      },

      // Role Selection Route (protected but no role check)
      {
        element: <RoleSelectionRoute />,
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
