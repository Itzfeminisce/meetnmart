// components/PulseOverview.tsx
import React, { useState } from 'react';
import {
  Clock,
  Truck,
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  Zap,
  Star,
  Heart,
  MessageSquare,
  Eye,
  Gauge,
  ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInteractionStatsStore } from '@/contexts/Store';

type MarqueeSpeed = 'slow' | 'medium' | 'fast' | 'veryFast';

interface FeedOverviewProps {
  /**
   * Speed of the marquee animation
   * Options: 'slow' | 'medium' | 'fast' | 'veryFast'
   * Default: 'veryFast'
   */
  marqueeSpeed?: MarqueeSpeed;
}

const SPEED_PRESETS = {
  slow: 45,
  medium: 30,
  fast: 15,
  veryFast: 8
} as const;

export const FeedOverview: React.FC<FeedOverviewProps> = ({
  marqueeSpeed = 'veryFast'
}) => {
  const feedOverviewStats = useInteractionStatsStore(ctx => ctx.data)
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<MarqueeSpeed>(marqueeSpeed);
  const [showControls, setShowControls] = useState(false);

  const handleSpeedChange = (newSpeed: MarqueeSpeed) => {
    setSpeed(newSpeed);
  };


  // {
  //   sellers_online: 0,
  //   buyer_needs: 0,
  //   delivery_pings: 0,
  //   trending_items: 0,
  //   urgent_requests: 0,
  //   saved_items: 0,
  //   active_chats: 0,
  //   views_today: 0,
  // };
  const stats = [
    {
      icon: <Users className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.sellers_online} sellers online`,
      color: "text-emerald-500"
    },
    {
      icon: <ShoppingBag className="w-3.5 h-3.5 animate-bounce" />,
      text: `${feedOverviewStats.buyer_needs} buyer needs posted in last hour`,
      color: "text-sky-500"
    },
    {
      icon: <Package className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.delivery_pings} delivery agents active`,
      color: "text-violet-500"
    },
    {
      icon: <TrendingUp className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.trending_items} trending items today`,
      color: "text-orange-500"
    },
    // {
    //   icon: <DollarSign className="w-3.5 h-3.5 animate-pulse" />,
    //   text: "₦352K worth of deals today",
    //   color: "text-green-500"
    // },
    {
      icon: <Zap className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.urgent_requests} urgent requests`,
      color: "text-red-500"
    },
    // {
    //   icon: <Star className="w-3.5 h-3.5 animate-pulse" />,
    //   text: "175 new reviews in last hour",
    //   color: "text-yellow-500"
    // },
    {
      icon: <Heart className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.saved_items} saved items`,
      color: "text-pink-500"
    },
    {
      icon: <MessageSquare className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.active_chats} active chats`,
      color: "text-blue-500"
    },
    {
      icon: <Eye className="w-3.5 h-3.5 animate-pulse" />,
      text: `${feedOverviewStats.views_today} views today`,
      color: "text-indigo-500"
    }
  ];

  return (
    <div
      className="overflow-hidden bg-gradient-to-r from-background via-muted/50 to-background relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Speed Control UI */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90">
              <Gauge className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => handleSpeedChange('slow')}>
              <span className="flex items-center justify-between w-full">
                Slow
                {speed === 'slow' && <span className="text-primary">✓</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSpeedChange('medium')}>
              <span className="flex items-center justify-between w-full">
                Medium
                {speed === 'medium' && <span className="text-primary">✓</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSpeedChange('fast')}>
              <span className="flex items-center justify-between w-full">
                Fast
                {speed === 'fast' && <span className="text-primary">✓</span>}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSpeedChange('veryFast')}>
              <span className="flex items-center justify-between w-full">
                Very Fast
                {speed === 'veryFast' && <span className="text-primary">✓</span>}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3">
        <style>
          {`
            @keyframes marquee {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}
        </style>
        <div
          className="flex items-center space-x-8 text-sm whitespace-nowrap hover:cursor-grab active:cursor-grabbing transition-all duration-300"
          style={{
            animation: `marquee ${SPEED_PRESETS[speed]}s linear infinite ${isPaused ? 'paused' : 'running'}`,
            willChange: 'transform'
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* First set of stats */}
          {stats.map((stat, index) => (
            <div key={index} className={`flex items-center space-x-2 ${stat.color} flex-shrink-0 font-medium`}>
              {stat.icon}
              <span>{stat.text}</span>
            </div>
          ))}

          {/* Duplicate set for seamless scrolling */}
          {stats.map((stat, index) => (
            <div key={`dup-${index}`} className={`flex items-center space-x-2 ${stat.color} flex-shrink-0 font-medium`}>
              {stat.icon}
              <span>{stat.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};