import React from 'react'
import { CheckCircle } from 'lucide-react'
import CustomDialog from './ui/custom-dialog'

interface SellerMarketCategorySelectionConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
}

const SellerMarketCategorySelectionConfirmationModal: React.FC<SellerMarketCategorySelectionConfirmationModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <CustomDialog 
      open={isOpen} 
      onOpenChange={onClose}
      dialogTitle="That's all"
      showSubmitButton={false}
      onCancel={(close) => close(isOpen)}
    >
      <div className="flex flex-col items-center p-8 text-center">
        <div className="mb-6 rounded-full bg-market-orange/10 p-4">
          <CheckCircle className="h-14 w-14 text-market-orange" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Your Selections Has Been Saved
          </h3>
          
          <p className="text-muted-foreground leading-relaxed">
            Your profile is now visible to potential buyers in your selected markets and catgories. 
            You will receive notifications when buyers express interest in your listings.
          </p>
        </div>
      </div>
    </CustomDialog>
  )
}

export default SellerMarketCategorySelectionConfirmationModal