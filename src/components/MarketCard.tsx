import { MarketWithAnalytics } from "@/types";
import { CheckCircle, MapPin, SignpostIcon, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
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

    function _handleLearnMarketStat(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>){
        ev.stopPropagation()
        ev.preventDefault()
        handleLearnMarketStat?.(ev)
    }

    // function formatNumber(num: number, decimals: number = 1): string {
    //     return num.toFixed(decimals);
    // }

    return (
      <div
        className={`relative glass-morphism rounded-lg p-3 sm:p-4 cursor-pointer transition-all group ${isSelected || isMember
          ? 'ring-2 ring-market-orange bg-market-orange/5'
          : 'hover:bg-secondary/30'
          }`}
        onClick={() => !isMember && onToggle(market.id)}
      >
        {market.updated_recently && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <div className="relative">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-market-orange/40"></div>
              <SignpostIcon className="h-3 w-3 sm:h-4 sm:w-4 text-market-orange" />
            </div>
          </div>
        )}
  
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="flex-grow w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mb-1 max-w-[80%]">
              <div className="flex items-center justify-start gap-x-2">
                <Button onClick={()=>handleDeleteSelection?.({ criteria: "market_id", selectionId: market.id })} variant='ghost' size='sm' className={cn('hidden', isMember && 'inline-block')} ><Trash2 /></Button>
                <h3 className="font-medium text-base sm:text-lg">
                  {market.name}
                </h3>
              </div>
              {market.last_24hrs && (
                <span className="px-2 py-1 bg-market-orange/10 text-market-orange text-xs rounded-full whitespace-nowrap">
                  Hot Today
                </span>
              )}
            </div>
  
            <div className="flex flex-col sm:flex-row items-start sm:items-center text-xs sm:text-sm text-muted-foreground mb-2">
              <div className="flex items-center max-w-full">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{market.address}</span>
              </div>
            </div>
  
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 sm:mt-3">
              <div className="text-center p-1 sm:p-2 bg-market-orange/5 rounded-lg">
                <div className="text-sm sm:text-base font-medium text-market-orange">
                  {market.user_count}
                </div>
                <div className="text-[0.6rem] sm:text-xs text-muted-foreground">Active Shoppers</div>
              </div>
  
              <div className="text-center p-1 sm:p-2 bg-market-blue/5 rounded-lg">
                <div className="text-sm sm:text-base font-medium text-market-blue">
                  {market.impressions}
                  <span className="text-[0.6rem] sm:text-xs ml-1">({market.impressions_per_user.toFixed(2)}/user)</span>
                </div>
                <div className="text-[0.6rem] sm:text-xs text-muted-foreground">Views</div>
              </div>
  
              <div className="text-center p-1 sm:p-2 bg-market-green/5 rounded-lg">
                <div className="text-sm sm:text-base font-medium text-market-green">
                  {market.recent_count}
                </div>
                <div className="text-[0.6rem] sm:text-xs text-muted-foreground">New Today</div>
              </div>
            </div>
          </div>
  
          <div className="absolute sm:relative bottom-2 right-2 sm:bottom-auto sm:right-auto mt-2 sm:mt-0 sm:ml-4">
            {isSelected || isMember ? (
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-market-orange animate-pop-in" />
            ) : (
              <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
            )}
          </div>
        </div>
  
        <div className="mt-2 sm:mt-3">
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-market-orange transition-all duration-500"
              style={{ width: `${Math.min((market.age_hours / 720) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Market maturity: {Math.round(market.age_hours / 24)} days
          </div>
        </div>
  
        <Separator className='my-4' />
        <div className='w-full flex items-center justify-between'>
          <p className='text-xs text-muted-foreground'>
            <button className='pr-1 font-bold m-0 text-market-orange hover:underline' onClick={_handleLearnMarketStat}>Learn more</button>
            to use these stats for you advantage</p>
        </div>
      </div>
    );
  };