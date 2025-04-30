
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

export const appRoutes = [
  { path: "/", element: <Index />, name: "Home" },
  { path: "/markets", element: <MarketSelection />, name: "Markets" },
  { path: "/categories", element: <CategorySelection />, name: "Categories" },
  { path: "/sellers", element: <SellersList />, name: "Sellers" },
  { path: "/call", element: <LiveCall />, name: "Live Call" },
  { path: "/rating", element: <RatingFeedback />, name: "Rating" },
  { path: "/role-selection", element: <RoleSelection />, name: "Select Role" },
  { path: "/seller-dashboard", element: <SellerDashboard />, name: "Seller Dashboard" },
  { path: "/buyer-dashboard", element: <BuyerDashboard />, name: "Buyer Dashboard" },
  { path: "/edit-profile", element: <EditSellerProfile />, name: "Edit Profile" },
  { path: "*", element: <NotFound />, name: "404" },
];
