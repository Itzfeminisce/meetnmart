import React from 'react';
import { MapPin, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketCardProps {
  name: string;
  isSelected?: boolean;
  onClick?: () => void;
  shoppersCount?: number;
  views?: number;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  name,
  isSelected = false,
  onClick,
  shoppersCount = 0,
  views = 0
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1.5 p-3 rounded-lg transition-colors w-full text-left",
        isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted hover:bg-muted/80"
      )}
    >
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium text-sm truncate">{name}</span>
      </div>
      
      <div className="flex items-center gap-3 text-xs opacity-80">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3 shrink-0" />
          <span>{shoppersCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3 shrink-0" />
          <span>{views}</span>
        </div>
      </div>
    </button>
  );
}; 