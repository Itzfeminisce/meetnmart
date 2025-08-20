import React from 'react';
import { MarketCard } from './MarketCard';

interface Market {
  name: string;
  shoppersCount: number;
  views: number;
}

interface MarketScrollProps {
  markets: Market[];
  selectedMarket: string;
  onMarketChange: (market: string) => void;
}

export const MarketScroll: React.FC<MarketScrollProps> = ({
  markets,
  selectedMarket,
  onMarketChange
}) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {markets.map((market) => (
        <MarketCard
          key={market.name}
          name={market.name}
          isSelected={market.name === selectedMarket}
          onClick={() => onMarketChange(market.name)}
          shoppersCount={market.shoppersCount}
          views={market.views}
        />
      ))}
    </div>
  );
}; 