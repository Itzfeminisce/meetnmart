import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';


interface UseSocialAuthProps {
  redirectTo?: string;
  flow?: "login" | "signup";
}

export function useSocialAuth({
  redirectTo,
  flow,
}: UseSocialAuthProps) {
  const [isLoading, setIsLoading] = useState<'google' | null>(null);

  const handleAuth = useCallback(async (provider: 'google') => {
    setIsLoading(provider);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${redirectTo || window.location.origin}/?${new URLSearchParams({
            provider,
            flow,
          }).toString()}`,
        },
      });
    } catch (error) {
      throw error
    } finally {
      setIsLoading(null);
    }
  }, [redirectTo]);


  return {
    isLoading,
    handleAuth,
  };
} 