import React from 'react';
import { MapPin, Users, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ClassNameValue } from 'tailwind-merge';

interface FindMarketCardProps {
  name: string;
  linkHref: string
  shoppersCount?: number;
  views?: number;
  className?: ClassNameValue;
}

export const FindMarketCard: React.FC<FindMarketCardProps> = ({
  name,
  className,
  linkHref,
  shoppersCount = 0,
  views = 0,
}) => {
  return (
    <Link
      to={linkHref}
      className={cn(
        "flex flex-col gap-1.5 p-3 rounded-lg transition-colors w-full text-left bg-opacity-50 hover:bg-opacity-70", className)}
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
    </Link>
  );
}; 