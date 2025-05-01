import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useRoutes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { appRoutes } from "./routes";
import { SocketProvider } from "./contexts/SocketContext";
import { getEnvVar } from "./lib/utils";

const queryClient = new QueryClient();

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


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <SocketProviderWithAuth>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </SocketProviderWithAuth>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
