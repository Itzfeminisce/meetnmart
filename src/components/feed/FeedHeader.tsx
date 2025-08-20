// components/FeedHeader.tsx
import React, { useState } from 'react';
import { MapPin, MessageSquareMore, Plus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppHeader from '../AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { FeedItem } from '@/types';
import { useFeedStore } from '@/contexts/Store';
import { Marquee } from '../Marquee';
import { Link, useNavigate } from 'react-router-dom';
import { useBottomSheet } from '../ui/bottom-sheet-modal';
import { FeedFormBody, FeedFormFooter, FeedFormHeader } from './FeedForm';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getInitials } from '@/lib/utils';
import { Sidebar } from '../Sidebar';

interface Market {
  name: string;
  shoppersCount: number;
  views: number;
  isJoined?: boolean;
  trending?: boolean;
  rating?: number;
}

interface FeedHeaderProps {
  selectedMarket: string;
  onMarketChange: (market: string) => void;
  feeds?: FeedItem[];
  currentTime: Date;
  onFormOpenChange: (open: boolean) => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  selectedMarket,
  onMarketChange,
  currentTime,
  onFormOpenChange,
}) => {
  const { profile } = useAuth()
  const isMobile = useIsMobile();
  const feedsStore = useFeedStore()
  const { open } = useBottomSheet()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false);



  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleShowSidebar = () => {
    if(!isMobile) return;
setSidebarOpen(true)
  }

  return (
    <>
      <AppHeader
        title="Feeds"
        subtitle={
          <Marquee scroll={false} text={`${getGreeting()}, ${profile.name}`} />
        }
        // search={{
        //   onSearch(query) {
        //     feedsStore.filterBy({
        //       search: query
        //     })
        //   },
        // }} 
        rightContent={
          <Avatar onClick={handleShowSidebar} className="h-10 w-10 cursor-pointer ring-2 ring-market-orange/20 hover:ring-market-orange/40 transition-all">
            <AvatarImage src={profile?.avatar} alt="Profile" />
            <AvatarFallback className="bg-marring-market-orange/10 text-marring-market-orange font-semibold text-lg">
              {getInitials(profile?.name)}
            </AvatarFallback>
          </Avatar>
        }
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
};