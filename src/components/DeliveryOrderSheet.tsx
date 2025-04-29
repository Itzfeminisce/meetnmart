import { useState } from 'react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Truck, MapPin, Package, DollarSign } from 'lucide-react';

interface DeliveryOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerLocation: string;
  onSubmit: (orderDetails: any) => void;
}

const DeliveryOrderSheet = ({ 
  open, 
  onOpenChange, 
  sellerLocation,
  onSubmit 
}: DeliveryOrderSheetProps) => {
  const [pickupLocation, setPickupLocation] = useState(sellerLocation);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [goodsDescription, setGoodsDescription] = useState('');
  const [priceOffer, setPriceOffer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const orderDetails = {
      pickupLocation,
      deliveryAddress,
      goodsDescription,
      priceOffer: priceOffer ? parseFloat(priceOffer) : null
    };
    
    onSubmit(orderDetails);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck size={20} />
            Delivery Order Sheet
          </SheetTitle>
          <SheetDescription>
            Fill in the details for your delivery request before inviting agents.
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-market-orange" />
              <Label htmlFor="pickupLocation">Pickup Location (Seller)</Label>
            </div>
            <Input
              id="pickupLocation"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Enter pickup location"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-market-green" />
              <Label htmlFor="deliveryAddress">Delivery Address</Label>
            </div>
            <Textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your delivery address"
              required
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package size={16} />
              <Label htmlFor="goodsDescription">Type/Description of Goods</Label>
            </div>
            <Textarea
              id="goodsDescription"
              value={goodsDescription}
              onChange={(e) => setGoodsDescription(e.target.value)}
              placeholder="Describe the items for delivery (size, weight, fragility, etc.)"
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-market-green" />
              <Label htmlFor="priceOffer">Price Offer (Optional)</Label>
            </div>
            <div className="relative">
              <DollarSign 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                id="priceOffer"
                type="number"
                value={priceOffer}
                onChange={(e) => setPriceOffer(e.target.value)}
                placeholder="Enter amount you're willing to pay"
                className="pl-8"
                step="0.01"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to discuss price with the delivery agent during the call.
            </p>
          </div>
          
          <SheetFooter>
            <Button type="submit" className="w-full">
              Continue to Available Agents
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default DeliveryOrderSheet;