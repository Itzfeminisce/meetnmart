import { Badge } from '@/components/ui/badge';
import { getInitials } from '@/lib/utils';

interface CallParticipantProps {
  participant: {
    name: string;
    avatar?: string;
    description?: string;
  };
  callDuration: number;
  badge?: string;
}

const CallParticipant = ({ participant, callDuration, badge }: CallParticipantProps) => {
  // Format duration as mm:ss
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3">
        <div className="h-40 w-40 rounded-full overflow-hidden bg-secondary/30 border-4 border-market-orange/50 flex items-center justify-center">
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={participant.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-4xl font-bold text-muted-foreground">
              {getInitials(participant.name)}
            </div>
          )}
        </div>
        
        <div className="absolute bottom-2 right-2 glass-morphism px-2 py-1 rounded-full text-xs">
          {formatDuration(callDuration)}
        </div>
        
        {badge && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
            {badge}
          </Badge>
        )}
      </div>
      
      <div className="w-full max-w-xs text-center">
        <h2 className="text-lg font-medium">{participant.name}</h2>
        {participant.description && (
          <p className="text-muted-foreground text-sm">{participant.description}</p>
        )}
      </div>
    </div>
  );
};

export default CallParticipant;