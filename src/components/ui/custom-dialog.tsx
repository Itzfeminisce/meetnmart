import React, { PropsWithChildren, ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from './scroll-area';
import { UseFormReturn } from 'react-hook-form';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface Props extends PropsWithChildren {
    dialogTitle: ReactNode;
    form?: UseFormReturn<any>;
    onSubmit?: () => Promise<void>;
    submitButtonText?: string;
    onCancel?: (setState: (value: boolean) => void) => void;
    open: boolean;
    onOpenChange: (value: boolean) => void;
    showSubmitButton: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const CustomDialog: React.FC<Props> = ({ 
    showSubmitButton = false, 
    onOpenChange, 
    open, 
    dialogTitle, 
    children, 
    form, 
    onCancel, 
    onSubmit, 
    submitButtonText,
    className,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl'
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "bg-background backdrop-blur-sm border border-border/50 shadow-lg p-0 w-full sm:w-[95vw] md:w-[90vw] lg:w-[85vw]",
                sizeClasses[size],
                className
            )}>
                <DialogHeader className="p-6 border-b border-border/40 bg-background/50">
                    <DialogTitle className="text-gradient text-2xl font-bold text-center">
                        {dialogTitle}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] px-6 py-4 bg-background/50">
                    <div className="max-w-[90%] mx-auto">
                        {children}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t border-border/40 bg-background/50">
                    <div className="flex justify-end gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCancel?.(() => onOpenChange(open))}
                            disabled={form && form.formState.isSubmitting}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>

                        {showSubmitButton && (
                            <Button
                                onClick={form && form.handleSubmit(onSubmit)}
                                type="submit"
                                disabled={form && form.formState.isSubmitting}
                                className="min-w-[100px] bg-market-orange hover:bg-market-orange/90 text-white"
                            >
                                {form && form.formState.isSubmitting ? "Processing..." : submitButtonText || "Continue"}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CustomDialog