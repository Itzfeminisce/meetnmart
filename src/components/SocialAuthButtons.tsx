import { Button } from '@/components/ui/button';
import { Google, } from '@/components/ui/icons';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { AuthResponse } from '@supabase/supabase-js';

interface SocialAuthButtonsProps {
  onSuccess?: (response: AuthResponse) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  flow: "login" | "signup"
  providers?: string[];
}



export function SocialAuthButtons({
  redirectTo,
  flow,
  providers, // Default to Google only
}: SocialAuthButtonsProps) {
  const { isLoading, handleAuth, } = useSocialAuth({ redirectTo, flow });

  return (
    <>
      {providers.map((provider) => {
        return (
          <Button
            key={provider}
            variant="outline"
            type="button"
            disabled={isLoading !== null}
            onClick={() => handleAuth("google")}
            className={`w-full flex items-center justify-center gap-2 border`}
          >
            {isLoading === provider ? (
              <div className="h-5 w-5 animate-spin rounded-full border-b-2" />
            ) : (
              <Google className="h-5 w-5" />
            )}
            <span>Continue with <span className='capitalize'>{provider}</span></span>
          </Button>
        );
      })}

      {/* {providers.length > 0 && (
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t " />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      )} */}
    </>
  );
}
