import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface ProtectedComponentState {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  buttonText: string;
  buttonDisabled: boolean;
  buttonOnClick: () => void;
  dialogIcon: React.ReactNode;
}

const ProtectedComponentContext = React.createContext<ProtectedComponentState | null>(null);

interface ProtectedComponentProviderProps extends Partial<ProtectedComponentState> {
  children: React.ReactNode;
}

export function ProtectedComponentProvider({
  children,
  open: initialOpen = false,
  title = "Protected",
  description = "Protected Component. Check back later!",
  buttonText = "Unavailable",
  buttonDisabled = true,
  buttonOnClick = () => {},
  dialogIcon = <Sparkles className="text-yellow-400 animate-pulse" />,
}: ProtectedComponentProviderProps) {
  const [open, setOpen] = React.useState(initialOpen);

  const value: ProtectedComponentState = {
    open,
    setOpen,
    title,
    description,
    buttonText,
    buttonDisabled,
    buttonOnClick,
    dialogIcon,
  };

  return (
    <ProtectedComponentContext.Provider value={value}>
      {children}
    </ProtectedComponentContext.Provider>
  );
}

export function useProtectedComponent() {
  const context = React.useContext(ProtectedComponentContext);
  if (!context) {
    throw new Error("useProtectedComponent must be used within a ProtectedComponentProvider");
  }
  return context;
}

interface ProtectedComponentProps {
  children?: React.ReactElement;
  showBadge?: boolean;
  badgeIcon?: React.ReactNode;
  className?: string;
}

export function ProtectedComponent({
  children,
  showBadge = true,
  badgeIcon = <Lock className="w-2 h-2 text-white" />,
  className = "",
}: ProtectedComponentProps) {
  const {
    open,
    setOpen,
    title,
    description,
    buttonText,
    buttonDisabled,
    buttonOnClick,
    dialogIcon,
  } = useProtectedComponent();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  const wrapped = children
    ? React.cloneElement(children, {
        onClick: handleClick,
        className: `${children.props.className ?? ""} relative flex items-center justify-center ${className}`,
      })
    : null;

  return (
    <>
      <div className="relative inline-block">
        {wrapped}

        {showBadge && badgeIcon && (
          <div className="absolute -top-1 -right-1 bg-gradient-to-br to-market-orange from-market-purple rounded-full p-1 shadow-md z-10">
            {badgeIcon}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-xl text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-center gap-2">
              {dialogIcon}
              {title}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          <Button
            disabled={buttonDisabled}
            size="sm"
            variant="secondary"
            onClick={() => {
              buttonOnClick();
              setOpen(false);
            }}
            className="mt-6"
          >
            {buttonText}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Specific presets:

interface PresetComponentProps {
  children?: React.ReactElement;
}

export const ComingSoon = ({ children }: PresetComponentProps) => {
  return (
    <ProtectedComponentProvider
      title="Coming Soon"
      description="This feature is on the way — stay tuned!"
      buttonText="Got it"
      buttonDisabled={false}
      buttonOnClick={() => {}}
      dialogIcon={<Sparkles className="text-yellow-400 animate-pulse" />}
    >
      <ProtectedComponent
        badgeIcon={<Sparkles className="w-2.5 h-2.5 text-white animate-pulse" />}
      >
        {children}
      </ProtectedComponent>
    </ProtectedComponentProvider>
  );
};

export const PremiumFeature = ({ children }: PresetComponentProps) => {
  return (
    <ProtectedComponentProvider
      title="Premium Feature"
      description="Unlock this feature by upgrading your plan to Pro."
      buttonText="Upgrade Now"
      buttonDisabled={false}
      buttonOnClick={() => (window.location.href = "/pricing")}
      dialogIcon={<Lock className="text-pink-500 animate-pulse" />}
    >
      <ProtectedComponent badgeIcon={<Lock className="w-2 h-2 text-white" />}>
        {children}
      </ProtectedComponent>
    </ProtectedComponentProvider>
  );
};