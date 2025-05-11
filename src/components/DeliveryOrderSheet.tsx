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
import { Textarea } from '@/components/ui/textarea';
import { Truck, MapPin, Package, DollarSign } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

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
  const form = useForm({
    defaultValues: {
      pickupLocation: sellerLocation,
      deliveryAddress: '',
      goodsDescription: '',
      priceOffer: '',
    }
  });

  const handleSubmit = (data: any) => {
    const orderDetails = {
      pickupLocation: data.pickupLocation,
      deliveryAddress: data.deliveryAddress,
      goodsDescription: data.goodsDescription,
      priceOffer: data.priceOffer ? parseFloat(data.priceOffer) : null
    };
    onSubmit(orderDetails);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Truck size={20} />
            Delivery Order Sheet
          </SheetTitle>
          <SheetDescription>
            Fill in the details for your delivery request before inviting agents.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
              <FormField
                control={form.control}
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-market-orange" />
                      <FormLabel>Pickup Location (Seller)</FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter pickup location"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-market-green" />
                      <FormLabel>Delivery Address</FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter your delivery address"
                        required
                        className="resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goodsDescription"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package size={16} />
                      <FormLabel>Type/Description of Goods</FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe the items for delivery (size, weight, fragility, etc.)"
                        className="resize-none"
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priceOffer"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-market-green" />
                      <FormLabel>Price Offer (Optional)</FormLabel>
                    </div>
                    <div className="relative">
                      <DollarSign 
                        size={16} 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
                      />
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter amount you're willing to pay"
                          className="pl-8"
                          step="0.01"
                          min="0"
                        />
                      </FormControl>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave blank to discuss price with the delivery agent during the call.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        
        <SheetFooter>
          <Button 
            type="submit" 
            onClick={form.handleSubmit(handleSubmit)} 
            className="w-full"
          >
            Continue to Available Agents
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default DeliveryOrderSheet;