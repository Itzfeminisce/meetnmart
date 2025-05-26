import React, { PropsWithChildren, ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from './scroll-area';
import { UseFormReturn } from 'react-hook-form';
import { Button } from './button';


interface Props extends PropsWithChildren {
    dialogTitle: ReactNode;
    form?: UseFormReturn<any>;
    onSubmit?: () => Promise<void>;
    submitButtonText?: string;
    onCancel?: (setState: (value: boolean) => void) => void;
    open: boolean;
    onOpenChange: (value: boolean) => void;
    showSubmitButton: boolean;
  }

const CustomDialog: React.FC<Props> = ({ showSubmitButton = false, onOpenChange, open, dialogTitle, children, form, onCancel, onSubmit, submitButtonText }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-morphism p-4 w-full">
                <DialogHeader className="flex flex-col items-center text-center">
                    <DialogTitle className="text-gradient text-2xl font-bold">
                        {dialogTitle}
                    </DialogTitle>

                </DialogHeader>


                <ScrollArea className="max-h-[60vh]">
                    <div className="max-w-[90%] mx-auto">
                        {children}
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onCancel(() => onOpenChange(open))}
                            disabled={form && form.formState.isSubmitting}
                        >
                            Cancel
                        </Button>

                        {showSubmitButton && (
                            <Button
                                onClick={form && form.handleSubmit(onSubmit)}
                                type="submit"
                                disabled={form && form.formState.isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white"
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