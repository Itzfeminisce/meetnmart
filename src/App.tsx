import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useNavigate, useRoutes, useSearchParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { appRoutes } from "./routes";
import { SocketProvider } from "./contexts/SocketContext";
import { getEnvVar } from "./lib/utils";
import { LiveCallProvider as LiveCallProvider_V2 } from "./contexts/live-call-context";
import { PaystackProvider } from "./contexts/paystack-context";
import { ScrollToTop } from "./components/ScrollTop";
import { Suspense, useEffect } from "react";
import Loader from "./components/ui/loader";
import NotificationListener from "./components/NotificationListener";
import { useNotifications } from "./hooks/useNotification";
import { AuthProviderV2 } from "./contexts/AuthContextV2";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,

      throwOnError: () => false,
    },
  },
});

const Router = () => useRoutes(appRoutes);


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


const App = () => {
 
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <Suspense>
          <AuthProviderV2>
            <SocketProviderWithAuth>
              <BrowserRouter>
                <PaystackProvider>
                  <ScrollToTop />
                  <NotificationListener />
                  <LiveCallProvider_V2>
                    <Router />
                  </LiveCallProvider_V2>
                </PaystackProvider>
              </BrowserRouter>
            </SocketProviderWithAuth>
          </AuthProviderV2>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  )
};

export default App;
