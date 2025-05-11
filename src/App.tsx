import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation, useNavigate, useRoutes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { appRoutes } from "./routes";
import { SocketProvider } from "./contexts/SocketContext";
import { getEnvVar } from "./lib/utils";
// import { LiveCallPovider } from "./contexts/LiveCallContext";
import { useEffect } from "react";
import { LiveCallProvider as LiveCallProvider_V2 } from "./contexts/live-call-context";
import { PaystackProvider } from "./contexts/paystack-context";

const queryClient = new QueryClient();

// const Router = () => useRoutes(appRoutes);

const Router = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect runs only on initial load
    const { pathname, search, hash } = location;

    // Combine the full URL path
    const fullPath = pathname + search + hash;

    // Only correct if the current location doesn't match
    if (fullPath !== '/' && fullPath !== location.pathname + location.search + location.hash) {
      navigate(fullPath, { replace: true });
    }
  }, []); // Empty dependency array means this runs once on mount

  return useRoutes(appRoutes);
};


// Socket provider wrapper that gets token from auth context
const SocketProviderWithAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <SocketProvider
      url={getEnvVar("VITE_API_URL")}
      autoConnect={isAuthenticated} // Only connect if user is authenticated
      defaultToken={user?.id}
    >
      {children}
    </SocketProvider>
  );
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SocketProviderWithAuth>
          <BrowserRouter>
            {/* <LiveCallPovider> */}
            <PaystackProvider>
              <LiveCallProvider_V2>
                <Router />
                {/* </LiveCallPovider> */}
              </LiveCallProvider_V2>
            </PaystackProvider>
          </BrowserRouter>
        </SocketProviderWithAuth>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
