import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { motion, useMotionValue, animate, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  viewId?: string;
  internalId?: string;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  data?: Record<string, any>;
  onClose?: () => void;
  closable?: boolean;
  persistent?: boolean;
}

interface BottomSheetContextType {
  open: (props: BottomSheetProps) => void;
  close: () => void;
  closeById: (id: string) => void;
  closeAll: () => void;
  isOpen: boolean;
  topSheet: BottomSheetProps | null;
  sheetCount: number;
  getData: (id?: string) => Record<string, any> | undefined;
  updateData: (id: string, data: Record<string, any>) => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

// Create a separate context for sheet data to avoid circular dependencies
const SheetDataContext = createContext<{
  data?: Record<string, any>;
  updateData?: (newData: Record<string, any>) => void;
}>({});

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetStack, setSheetStack] = useState<BottomSheetProps[]>([]);
  const closingRef = useRef<Set<string>>(new Set());

  const open = useCallback((props: BottomSheetProps) => {
    const internalId = props.internalId ?? nanoid();

    setSheetStack((prev) => {
      // Check if sheet is already open
      const alreadyOpen = prev.find(
        (s) => s.viewId === props.viewId && s.internalId === internalId
      );
      if (alreadyOpen) return prev;

      const newSheet = {
        ...props,
        internalId,
        closable: props.closable ?? true,
        persistent: props.persistent ?? false,
      };

      return [...prev, newSheet];
    });
  }, []);

  const close = useCallback(() => {
    setSheetStack((prev) => {
      if (prev.length === 0) return prev;
      const topSheet = prev[prev.length - 1];

      if (topSheet.internalId) {
        // Don't call closeById here - just close directly
        // Call custom close handler if provided
        if (topSheet.onClose) {
          try {
            topSheet.onClose();
          } catch (error) {
            console.error('Error in sheet onClose handler:', error);
          }
        }

        // Add to closing ref to prevent duplicate closes
        closingRef.current.add(topSheet.internalId);

        // Clean up closing ref after a short delay
        setTimeout(() => {
          closingRef.current.delete(topSheet.internalId!);
        }, 100);

        // Return new stack without the top sheet
        return prev.slice(0, -1);
      }

      return prev;
    });
  }, []);

  const closeById = useCallback((id: string) => {
    // Prevent duplicate close attempts
    if (closingRef.current.has(id)) return;
    closingRef.current.add(id);

    setSheetStack((prev) => {
      const sheetToClose = prev.find((s) => s.internalId === id);
      if (!sheetToClose) {
        closingRef.current.delete(id);
        return prev;
      }

      // Call custom close handler if provided
      if (sheetToClose.onClose) {
        try {
          sheetToClose.onClose();
        } catch (error) {
          console.error('Error in sheet onClose handler:', error);
        }
      }

      const newStack = prev.filter((s) => s.internalId !== id);

      // Clean up closing ref after a short delay
      setTimeout(() => {
        closingRef.current.delete(id);
      }, 100);

      return newStack;
    });
  }, []);

  const closeAll = useCallback(() => {
    setSheetStack((prev) => {
      // Call onClose for all sheets
      prev.forEach((sheet) => {
        if (sheet.onClose) {
          try {
            sheet.onClose();
          } catch (error) {
            console.error('Error in sheet onClose handler:', error);
          }
        }
      });

      closingRef.current.clear();
      return [];
    });
  }, []);

  const getData = useCallback((id?: string) => {
    if (!id) {
      return sheetStack[sheetStack.length - 1]?.data;
    }
    return sheetStack.find((s) => s.internalId === id)?.data;
  }, [sheetStack]);

  const updateData = useCallback((id: string, data: Record<string, any>) => {
    setSheetStack((prev) =>
      prev.map((sheet) =>
        sheet.internalId === id
          ? { ...sheet, data: { ...sheet.data, ...data } }
          : sheet
      )
    );
  }, []);

  const isOpen = sheetStack.length > 0;
  const topSheet = isOpen ? sheetStack[sheetStack.length - 1] : null;
  const sheetCount = sheetStack.length;

  const contextValue = useMemo(() => ({
    open,
    close,
    closeById,
    closeAll,
    isOpen,
    topSheet,
    sheetCount,
    getData,
    updateData,
  }), [open, close, closeById, closeAll, isOpen, topSheet, sheetCount, getData, updateData]);

  // Handle URL synchronization
  useEffect(() => {
    const updatedParams = new URLSearchParams(searchParams);
    if (topSheet?.viewId) {
      updatedParams.set('s_view_detail', topSheet.viewId);
    } else {
      updatedParams.delete('s_view_detail');
    }
    setSearchParams(updatedParams, { replace: true });
  }, [topSheet?.viewId, searchParams, setSearchParams]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && topSheet?.closable !== false) {
        if (topSheet?.internalId) {
          closeById(topSheet.internalId);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeById, topSheet]);

  // Prevent body scroll when sheets are open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <BottomSheetContext.Provider value={contextValue}>
      {children}

      <AnimatePresence>
        {sheetStack.map((sheet, index) => {
          const isTop = index === sheetStack.length - 1;
          const baseZ = 100 + index * 10;

          return (
            <BottomSheetLayer
              key={sheet.internalId}
              internalId={sheet.internalId!}
              isTop={isTop}
              zIndex={baseZ}
              onClose={() => closeById(sheet.internalId!)}
              {...sheet}
            />
          );
        })}
      </AnimatePresence>
    </BottomSheetContext.Provider>
  );
};

interface BottomSheetLayerProps {
  viewId?: string;
  internalId: string;
  header?: React.ReactNode;
  body?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  data?: Record<string, any>;
  isTop: boolean;
  zIndex: number;
  onClose: () => void;
  closable?: boolean;
  persistent?: boolean;
}

export const BottomSheetLayer = ({
  internalId,
  header,
  body,
  footer,
  className,
  data,
  isTop,
  zIndex,
  onClose,
  closable = true,
  persistent = false,
}: BottomSheetLayerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const closeAttemptRef = useRef(false);
  const SHEET_HEIGHT = typeof window !== "undefined" ? window.innerHeight * 0.9 : 800;
  const y = useMotionValue(0);
  const { updateData } = useBottomSheet();

  const handleClose = useCallback(() => {
    if (closeAttemptRef.current || !closable) return;

    closeAttemptRef.current = true;
    onClose();

    // Reset close attempt after animation
    setTimeout(() => {
      closeAttemptRef.current = false;
    }, 500);
  }, [closable, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTop && closable && !persistent && !closeAttemptRef.current) {
      handleClose();
    }
  }, [isTop, closable, persistent, handleClose]);

  const handleDragStart = useCallback(() => {
    if (!isTop || !closable || closeAttemptRef.current) return;
    setIsDragging(true);
  }, [isTop, closable]);

  const handleDragEnd = useCallback(
    (event: any, info: any) => {
      if (!isTop || !closable || closeAttemptRef.current) return;

      setIsDragging(false);

      const current = y.get();
      const dragDistance = current;
      const dragVelocity = info.velocity.y;

      // Close if dragged down significantly or with high velocity
      if (dragDistance > SHEET_HEIGHT * 0.25 || dragVelocity > 500) {
        handleClose();
        return;
      }

      // Otherwise snap back to closed position (y = 0)
      animate(y, 0, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    },
    [isTop, closable, y, SHEET_HEIGHT, handleClose]
  );

  const sheetDataContextValue = useMemo(() => ({
    data,
    updateData: (newData: Record<string, any>) => updateData(internalId, newData),
  }), [data, updateData, internalId]);

  const handleSheetClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
  }, [handleClose]);

  return (
    <SheetDataContext.Provider value={sheetDataContextValue}>
      {isTop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80"
          style={{ zIndex }}
          onClick={handleBackdropClick}
        />
      )}

      <motion.div
        drag={isTop && closable && !closeAttemptRef.current ? "y" : false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={handleSheetClick}
        style={{
          y: isTop ? y : 0,
          zIndex: zIndex + 1,
          height: SHEET_HEIGHT,
        }}
        initial={{ y: SHEET_HEIGHT }}
        animate={{ y: 0 }}
        exit={{ y: SHEET_HEIGHT }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
        className={cn(
          `fixed inset-x-0 bottom-0 md:max-w-[70%] mx-auto bg-background rounded-t-3xl flex flex-col shadow-xl overflow-hidden`,
          isDragging ? "touch-none select-none" : "touch-auto",
          className
        )}
      >
        {isTop && closable && (
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/40 mx-auto mt-3 mb-2 cursor-grab active:cursor-grabbing" />
        )}

        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          {header ?? <div />}
          {isTop && closable && (
            <Button
              variant="outline"
              onClick={handleButtonClick}
              disabled={closeAttemptRef.current}
            >
              Close
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-small md:p-6">
          {body}
        </div>

        {footer && <div className="border-t bg-background">{footer}</div>}
      </motion.div>
    </SheetDataContext.Provider>
  );
};

// Hook to access sheet data from child components
export const useSheetData = () => {
  const context = useContext(SheetDataContext);
  return context;
};

export const useBottomSheet = (): BottomSheetContextType => {
  const context = useContext(BottomSheetContext);
  if (!context) throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  return context;
};

// Utility hook for common sheet operations
export const useSheetOperations = () => {
  const { open, close, closeById, closeAll, getData, updateData } = useBottomSheet();

  return {
    openSheet: open,
    closeSheet: close,
    closeSheetById: closeById,
    closeAllSheets: closeAll,
    getSheetData: getData,
    updateSheetData: updateData,
  };
};
