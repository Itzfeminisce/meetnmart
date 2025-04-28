
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="glass-morphism rounded-xl p-6 max-w-md w-full text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 text-gradient">404</h1>
        <p className="text-xl text-muted-foreground mb-8">This market doesn't exist... yet!</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-market-orange hover:bg-market-orange/90"
        >
          Back to Main Market
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
