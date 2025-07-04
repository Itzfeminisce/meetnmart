import React, { PropsWithChildren, ReactNode } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from './scroll-area'
import { UseFormReturn } from 'react-hook-form'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface Props extends PropsWithChildren {
  dialogTitle: ReactNode
  form?: UseFormReturn<any>
  onSubmit?: () => Promise<void>
  submitButtonText?: string
  onCancel?: (setState: (value: boolean) => void) => void
  open: boolean
  onOpenChange: (value: boolean) => void
  showSubmitButton?: boolean
  className?: string
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
  className
}) => {
  const isSubmitting = form?.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "bg-background backdrop-blur-sm border-none p-0 w-[95vw] max-w-4xl max-h-[100vh] sm:w-auto sm:min-w-[400px]",
        className, "pb-4", "[&>button.absolute.top-4.right-4]:hidden"
      )} >
        <DialogHeader className="border-b border-border/40 bg-background/50">
          <DialogTitle className="text-gradient text-xl font-bold text-center px-4">
            {dialogTitle}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="bg-background/50 max-h-[calc(100vh-8rem)] overflow-auto">
          {children}
        </ScrollArea>

        <DialogFooter className="border-t border-border/40 bg-background/50 pt-2">
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onCancel?.(() => onOpenChange(open))}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              Cancel
            </Button>

            {showSubmitButton && (
              <Button
                onClick={form?.handleSubmit(onSubmit)}
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px] bg-market-orange hover:bg-market-orange/90 text-white"
              >
                {isSubmitting ? "Processing..." : submitButtonText || "Continue"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CustomDialog