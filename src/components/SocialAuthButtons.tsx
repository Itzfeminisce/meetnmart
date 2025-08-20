import { cn } from "@/lib/utils"; // If you're using class merging
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  onAuthRequested: (provider: string) => void;
  providers: { name: string; icon: any }[];
  isLoading: boolean;
}

export function SocialAuthButtons({
  providers,
  onAuthRequested,
  isLoading,
}: SocialAuthButtonsProps) {
  return (
    <div className="space-y-3">
      {providers.map(({ icon: Icon, name }) => (
        <button
          key={name}
          disabled={isLoading}
          onClick={() => onAuthRequested(name)}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-4 py-2 border border-input rounded-md bg-background hover:bg-background/20 active:bg-gray-100 text-sm font-medium transition-all",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-primary" />
          ) : (
            <div className="flex items-center  w-full ">
              <Icon className="h-8 w-8" />
              <span className="text-muted-foreground self-center w-full">
                Continue with <span className="capitalize">{name?.replace("_oidc", '')}</span>
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
