import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchableMarketSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  markets: string[];
  placeholder?: string;
}

export const SearchableMarketSelect: React.FC<SearchableMarketSelectProps> = ({
  value,
  onValueChange,
  markets,
  placeholder = "Select market..."
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMarkets = markets.filter(market =>
    market.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 border-0 focus:ring-0 bg-gray-500/20 dark:bg-gray-900/50 rounded-full pl-3 pr-8">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-sm truncate">{value}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <div className="sticky top-0 p-2 bg-background border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-1">
            {filteredMarkets.length > 0 ? (
              filteredMarkets.map(market => (
                <SelectItem 
                  key={market} 
                  value={market} 
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md"
                >
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{market}</span>
                  </div>
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                No markets found
              </div>
            )}
          </div>
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}; 