import { MarketWithAnalytics } from "@/types";
import { CheckCircle, MapPin, SignpostIcon, Trash2, Users, Eye, TrendingUp, Star, Heart, Award, X, Calendar, MessageCircle, Phone } from "lucide-react";
import { Button } from "./ui/button";
import React from "react";

export const MarketCard = ({
  market,
  isSelected,
  onToggle,
  handleLearnMarketStat,
  isMember,
  handleDeleteSelection
}: {
  market: MarketWithAnalytics;
  isSelected: boolean;
  isMember?: boolean;
  onToggle: (id: string) => void;
  handleDeleteSelection?: ({ criteria, selectionId }: {
    criteria: "category_id" | "market_id";
    selectionId: string;
  }) => Promise<void>
  handleLearnMarketStat?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) => {

  function _handleLearnMarketStat(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.stopPropagation()
    ev.preventDefault()
    handleLearnMarketStat?.(ev)
  }

  return (
    <div
      className={`relative glass-morphism rounded-xl p-4 cursor-pointer transition-all group hover:shadow-md ${isSelected || isMember
        ? 'ring-2 ring-market-orange bg-market-orange/5'
        : 'hover:bg-secondary/30'
        }`}
      onClick={() => !isMember && onToggle(market.id)}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {isMember && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSelection?.({ criteria: "market_id", selectionId: market.id });
                }}
                variant='ghost'
                size='sm'
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {/* Enhanced market name with larger font and better contrast */}
            <h3 className="font-bold text-lg text-foreground group-hover:text-market-orange transition-colors">
              {market.name}
            </h3>
            {market.last_24hrs && (
              <span className="px-2 py-0.5 bg-market-orange/10 text-market-orange text-xs rounded-full whitespace-nowrap">
                Hot
              </span>
            )}
          </div>

          {/* Enhanced address with better visual prominence */}
          <div className="flex items-center text-sm text-foreground/80 mb-3 bg-secondary/20 rounded-lg px-1 py-2 border border-secondary/40">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-market-orange" />
            <span className="font-medium">{market.address}</span>
          </div>

          {/* Maturity Bar */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-market-orange transition-all duration-500"
                style={{ width: `${Math.min((market.age_hours / 720) * 100, 100)}%` }}
              />
            </div>
            <span className="whitespace-nowrap">{Math.round(market.age_hours / 24)}d</span>
          </div>
        </div>

        {/* Selection & Status Icons */}
        <div className="flex items-center gap-2 ml-3">
          {market.updated_recently && (
            <div className="relative">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-market-orange/40"></div>
              <SignpostIcon className="h-4 w-4 text-market-orange" />
            </div>
          )}

          {isSelected || isMember ? (
            <CheckCircle className="h-5 w-5 text-market-orange animate-pop-in" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-secondary/20 mb-3">
        <img
          src="https://www.notion.so/image/https%3A%2F%2Fstorage.googleapis.com%2Fgmaps-handbook%2Fpublic%2Fcommon%2F6%2F6.2%2Fstatic-map-with-custom-marker-icon.png?table=block&id=5ae0e93d-2273-40e2-817b-5e8e7eafabdc&cache=v3"
          alt={`Map location for ${market.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/30 ">
          <MapPin className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="flex items-center gap-2 p-2 bg-market-orange/5 rounded-lg">
          <Users className="h-4 w-4 text-market-orange flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-market-orange">{market.user_count}</div>
            <div className="text-xs text-muted-foreground truncate">Shoppers</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-market-blue/5 rounded-lg">
          <Eye className="h-4 w-4 text-market-blue flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-market-blue">{market.impressions}</div>
            <div className="text-xs text-muted-foreground truncate">Views</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 bg-market-green/5 rounded-lg">
          <TrendingUp className="h-4 w-4 text-market-green flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-market-green">{market.recent_count}</div>
            <div className="text-xs text-muted-foreground truncate">New</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-secondary/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="text-market-blue font-medium">{market.impressions_per_user.toFixed(1)}</span> views/user
          </div>
          <button
            className="text-xs text-market-orange hover:underline font-medium"
            onClick={_handleLearnMarketStat}
          >
            Learn more
          </button>
        </div>
      </div>
    </div>
  );
};

