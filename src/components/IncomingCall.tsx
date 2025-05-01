import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Phone, PhoneOff, ChefHat, Pizza, Bike, ShoppingCart, Home } from "lucide-react"

const IncomingCall = ({
  open,
  onOpenChange,
  caller,
  category,
  location,
  onAccept,
  onReject,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  caller: string
  category: 'food' | 'delivery' | 'shopping' | 'other'
  location: string
  onAccept: () => void
  onReject: () => void
}) => {
  const categoryIcons = {
    food: <ChefHat className="w-6 h-6" />,
    delivery: <Bike className="w-6 h-6" />,
    shopping: <ShoppingCart className="w-6 h-6" />,
    other: <Phone className="w-6 h-6" />,
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[60vh] max-w-md mx-auto">
        <div className="flex flex-col h-full">
          <SheetHeader className="text-center">
            <SheetTitle className="text-2xl font-bold text-primary">Incoming Call</SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            {/* Caller Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center animate-pulse">
                <span className="text-4xl font-bold text-white">
                  {caller.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background p-2 rounded-full border-2 border-primary">
                {categoryIcons[category]}
              </div>
            </div>
            
            {/* Caller Info */}
            <div className="text-center space-y-1">
              <h2 className="text-3xl font-bold">{caller}</h2>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Home className="w-4 h-4" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-8 pb-0">
            <Button 
              variant="destructive"  
              size="lg" 
              className="rounded-full h-16 w-16"
              onClick={onReject}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
            <Button 
              variant="default" 
              size="lg" 
              className="rounded-full animate-bounce h-16 w-16 bg-green-500 hover:bg-green-600 "
              onClick={onAccept}
            >
              <Phone className="h-8 w-8" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export {IncomingCall}