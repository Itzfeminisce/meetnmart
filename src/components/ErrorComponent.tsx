import { AlertTriangle, RefreshCw, Wifi, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorComponentProps {
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

const ErrorComponent = ({ error, onRetry, className = "" }: ErrorComponentProps) => {
  // Determine error type and message
  const getErrorInfo = () => {
    let message = "Something went wrong";
    let description = "An unexpected error occurred. Please try again.";
    let icon = AlertTriangle;
    let code = "";

    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message || '';
      const errorString = errorMessage.toLowerCase();

      // Network errors
      if (errorString.includes('network') || errorString.includes('fetch') || errorString.includes('connection')) {
        message = "Connection Error";
        description = "Unable to connect to our servers. Please check your internet connection.";
        icon = Wifi;
        code = "NETWORK_ERROR";
      }
      // 400 errors
      else if (errorString.includes('400') || errorString.includes('bad request')) {
        message = "Bad Request";
        description = "There was an issue with your request. Please try again.";
        icon = AlertTriangle;
        code = "400";
      }
      // 500 errors
      else if (errorString.includes('500') || errorString.includes('internal server')) {
        message = "Server Error";
        description = "Our servers are experiencing issues. We're working on it.";
        icon = Server;
        code = "500";
      }
      // Generic errors with custom message
      else if (errorMessage) {
        message = "Error Occurred";
        description = errorMessage;
      }
    }

    return { message, description, icon, code };
  };

  const { message, description, icon: IconComponent, code } = getErrorInfo();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  return (
    <div className={`flex items-center justify-center h-screen p-4 ${className}`}>
      <Card className="w-full max-w-md bg-secondary/30 border-secondary/10">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="h-8 w-8 text-destructive" />
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{message}</h3>
            {code && (
              <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground mb-2">
                {code}
              </span>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              {description}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              className="w-full bg-market-orange hover:bg-market-orange/90"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full bg-secondary/50 border-none"
            >
              Go Home
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            If the problem persists, please contact support
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorComponent;