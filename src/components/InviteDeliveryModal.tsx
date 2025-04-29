import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DeliveryAgent } from '@/types';
import { Star, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { mockAgents } from '@/lib/mockData';
import { getInitials } from '@/lib/utils';

interface InviteDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (agent: DeliveryAgent) => void;
}

const InviteDeliveryModal = ({ open, onOpenChange, onSelect }: InviteDeliveryModalProps) => {
  const [loading, setLoading] = useState(true);
  const [availableAgents, setAvailableAgents] = useState<DeliveryAgent[]>([]);

  // Simulate API call to fetch nearby available delivery agents
  useEffect(() => {
    if (open) {
      setLoading(true);
      
      // Mock API call delay
      const timeout = setTimeout(() => {
        setAvailableAgents(mockAgents);
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Available Delivery Agents Nearby</DialogTitle>
          <DialogDescription>
            Select a delivery agent to invite them to this call.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            // Loading skeleton
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            // Actual agent list
            availableAgents.map((agent) => (
              <div 
                key={agent.id}
                className="border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="p-3 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    {agent.avatar ? (
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-lg font-bold text-muted-foreground">
                        {getInitials(agent.name)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{agent.name}</h3>
                      <div className="flex items-center">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1">{agent.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <CheckCircle2 size={12} />
                      <span>{agent.completedDeliveries} deliveries</span>
                      <span className="mx-1">•</span>
                      <Badge variant="outline" className="text-xs font-normal py-0">
                        {agent.transportType}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-3 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin size={12} className="mr-1" />
                        <span>{agent.distanceAway}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        <span>ETA: {agent.estimatedArrival}</span>
                      </div>
                    </div>
                    
                    {agent.specialties && agent.specialties.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {agent.specialties.map((specialty, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-3 pb-3 pt-1">
                  <Button 
                    onClick={() => onSelect(agent)} 
                    className="w-full"
                    variant="outline"
                  >
                    Invite to Call
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {!loading && availableAgents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No delivery agents available nearby at the moment.
              <br />
              Please try again later.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDeliveryModal;