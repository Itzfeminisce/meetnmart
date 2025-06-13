import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Star, MapPin, Clock, Package, RefreshCw, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { NearbySellerResponse } from '@/types';


// Filter configuration types
export interface SellerFilters {
  searchQuery: string;
  availabilityStatus: 'all' | 'online' | 'offline';
  sellerType: 'all' | 'premium' | 'verified' | 'reachable';
  minRating: number;
  maxDistance: number;
  sortBy: 'rating' | 'distance' | 'name' | 'products' | 'response_time';
  sortOrder: 'asc' | 'desc';
  hasProducts: boolean;
  inStockOnly: boolean;
  minProducts: number;
  productCategories: string[];
  priceRange: [number, number];
  hasReviews: boolean;
  minResponseTime: number;
  maxResponseTime: number;
}

interface SellerFilterProps {
  sellers: NearbySellerResponse[];
  onFiltersChange: (filteredSellers: NearbySellerResponse[], activeFilters: SellerFilters) => void;
  className?: string;
  categoryMap?: { [key: string]: string }; // Map category UUIDs to readable names
}

const defaultFilters: SellerFilters = {
  searchQuery: '',
  availabilityStatus: 'all',
  sellerType: 'all',
  minRating: 0,
  maxDistance: 50,
  sortBy: 'rating',
  sortOrder: 'desc',
  hasProducts: false,
  inStockOnly: false,
  minProducts: 0,
  productCategories: [],
  priceRange: [0, 100000],
  hasReviews: false,
  minResponseTime: 0,
  maxResponseTime: 60,
};

const SellerFilter: React.FC<SellerFilterProps> = ({
  sellers,
  onFiltersChange,
  className = '',
  categoryMap = {},
}) => {
  const [filters, setFilters] = useState<SellerFilters>(defaultFilters);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Extract unique product categories from sellers
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    sellers.forEach(seller => {
      seller.products.items.forEach(product => {
        if (product.category) {
          categories.add(product.category);
        }
      });
    });
    return Array.from(categories).sort();
  }, [sellers]);

  // Calculate price range from all products
  const priceRange = useMemo(() => {
    let minPrice = Infinity;
    let maxPrice = 0;
    
    sellers.forEach(seller => {
      seller.products.items.forEach(product => {
        if (product.price) {
          minPrice = Math.min(minPrice, product.price);
          maxPrice = Math.max(maxPrice, product.price);
        }
      });
    });
    
    return { 
      min: minPrice === Infinity ? 0 : minPrice, 
      max: maxPrice === 0 ? 100000 : maxPrice 
    };
  }, [sellers]);

  // Calculate response time range
  const responseTimeRange = useMemo(() => {
    let minTime = Infinity;
    let maxTime = 0;
    
    sellers.forEach(seller => {
      if (seller.avg_response_time_minutes) {
        minTime = Math.min(minTime, seller.avg_response_time_minutes);
        maxTime = Math.max(maxTime, seller.avg_response_time_minutes);
      }
    });
    
    return { 
      min: minTime === Infinity ? 0 : Math.floor(minTime), 
      max: maxTime === 0 ? 60 : Math.ceil(maxTime) 
    };
  }, [sellers]);

  // Apply filters to sellers
  const filteredSellers = useMemo(() => {
    let filtered = [...sellers];

    // Search query filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(seller => {
        const sellerNameMatch = seller.name.toLowerCase().includes(query);
        const sellerDescMatch = seller.seller_status.description.toLowerCase().includes(query);
        const productMatch = seller.products.items.some(product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
        return sellerNameMatch || sellerDescMatch || productMatch;
      });
    }

    // Availability status filter
    if (filters.availabilityStatus !== 'all') {
      filtered = filtered.filter(seller => {
        if (filters.availabilityStatus === 'online') {
          return seller.seller_status.is_online;
        } else {
          return !seller.seller_status.is_online;
        }
      });
    }

    // Seller type filter
    if (filters.sellerType !== 'all') {
      filtered = filtered.filter(seller => {
        switch (filters.sellerType) {
          case 'premium':
            return seller.seller_status.is_premium;
          case 'verified':
            return seller.seller_status.is_verified;
          case 'reachable':
            return seller.seller_status.is_reachable;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(seller => 
        (seller.reviews_summary.average_rating || 0) >= filters.minRating
      );
    }

    // Distance filter
    if (filters.maxDistance < 50) {
      filtered = filtered.filter(seller => 
        seller.distance_km <= filters.maxDistance
      );
    }

    // Has products filter
    if (filters.hasProducts) {
      filtered = filtered.filter(seller => 
        seller.products.items.length > 0
      );
    }

    // In stock only filter
    if (filters.inStockOnly) {
      filtered = filtered.filter(seller =>
        seller.products.items.some(product => product.in_stock)
      );
    }

    // Minimum products filter
    if (filters.minProducts > 0) {
      filtered = filtered.filter(seller => 
        seller.products.items.length >= filters.minProducts
      );
    }

    // Product categories filter
    if (filters.productCategories.length > 0) {
      filtered = filtered.filter(seller =>
        seller.products.items.some(product =>
          filters.productCategories.includes(product.category)
        )
      );
    }

    // Price range filter
    if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) {
      filtered = filtered.filter(seller =>
        seller.products.items.some(product =>
          product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
        )
      );
    }

    // Has reviews filter
    if (filters.hasReviews) {
      filtered = filtered.filter(seller => 
        seller.reviews_summary.total_reviews > 0
      );
    }

    // Response time filter
    if (filters.minResponseTime > 0 || filters.maxResponseTime < 60) {
      filtered = filtered.filter(seller => 
        seller.avg_response_time_minutes >= filters.minResponseTime && 
        seller.avg_response_time_minutes <= filters.maxResponseTime
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'rating':
          comparison = (a.reviews_summary.average_rating || 0) - (b.reviews_summary.average_rating || 0);
          break;
        case 'distance':
          comparison = a.distance_km - b.distance_km;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'products':
          comparison = a.products.items.length - b.products.items.length;
          break;
        case 'response_time':
          comparison = a.avg_response_time_minutes - b.avg_response_time_minutes;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [sellers, filters, priceRange.min, priceRange.max]);

  // Update search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: searchInput }));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Notify parent of changes
  useEffect(() => {
    onFiltersChange(filteredSellers, filters);
  }, [filteredSellers, filters, onFiltersChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.availabilityStatus !== 'all') count++;
    if (filters.sellerType !== 'all') count++;
    if (filters.minRating > 0) count++;
    if (filters.maxDistance < 50) count++;
    if (filters.hasProducts) count++;
    if (filters.inStockOnly) count++;
    if (filters.minProducts > 0) count++;
    if (filters.productCategories.length > 0) count++;
    if (filters.priceRange[0] > priceRange.min || filters.priceRange[1] < priceRange.max) count++;
    if (filters.hasReviews) count++;
    if (filters.minResponseTime > 0 || filters.maxResponseTime < 60) count++;
    return count;
  }, [filters, priceRange.min, priceRange.max]);

  const handleFilterChange = (key: keyof SellerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setSearchInput('');
  };

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(category)
        ? prev.productCategories.filter(c => c !== category)
        : [...prev.productCategories, category]
    }));
  };

  const getCategoryDisplayName = (categoryId: string): string => {
    return categoryMap[categoryId] || categoryId;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-market-orange text-white text-xs px-1 py-0 min-w-[1.2rem] h-5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Filter Sellers
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-market-orange hover:text-market-orange/80"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Clear All
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Quick Sort */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value: any) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="distance">Distance</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                        <SelectItem value="response_time">Response Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value: any) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">High to Low</SelectItem>
                        <SelectItem value="asc">Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Availability Status */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Availability</Label>
                  <Select 
                    value={filters.availabilityStatus} 
                    onValueChange={(value: any) => handleFilterChange('availabilityStatus', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sellers</SelectItem>
                      <SelectItem value="online">Online Only</SelectItem>
                      <SelectItem value="offline">Offline Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Seller Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Seller Type</Label>
                  <Select 
                    value={filters.sellerType} 
                    onValueChange={(value: any) => handleFilterChange('sellerType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="premium">Premium Only</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="reachable">Reachable Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Rating Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Minimum Rating: {filters.minRating === 0 ? 'Any' : `${filters.minRating}★`}
                  </Label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([value]) => handleFilterChange('minRating', value)}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Distance Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Maximum Distance: {filters.maxDistance === 50 ? 'Any' : `${filters.maxDistance}km`}
                  </Label>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={([value]) => handleFilterChange('maxDistance', value)}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Response Time Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Response Time: {filters.minResponseTime}-{filters.maxResponseTime} min
                  </Label>
                  <Slider
                    value={[filters.minResponseTime, filters.maxResponseTime]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minResponseTime', min);
                      handleFilterChange('maxResponseTime', max);
                    }}
                    max={responseTimeRange.max}
                    min={responseTimeRange.min}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Product Filters */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Product Filters</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasProducts"
                      checked={filters.hasProducts}
                      onCheckedChange={(checked) => handleFilterChange('hasProducts', checked)}
                    />
                    <Label htmlFor="hasProducts" className="text-sm">Has Products Listed</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inStockOnly"
                      checked={filters.inStockOnly}
                      onCheckedChange={(checked) => handleFilterChange('inStockOnly', checked)}
                    />
                    <Label htmlFor="inStockOnly" className="text-sm">In Stock Only</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasReviews"
                      checked={filters.hasReviews}
                      onCheckedChange={(checked) => handleFilterChange('hasReviews', checked)}
                    />
                    <Label htmlFor="hasReviews" className="text-sm">Has Reviews</Label>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">
                      Minimum Products: {filters.minProducts || 'Any'}
                    </Label>
                    <Slider
                      value={[filters.minProducts]}
                      onValueChange={([value]) => handleFilterChange('minProducts', value)}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                <Separator />

                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Price Range: ₦{filters.priceRange[0].toLocaleString()} - ₦{filters.priceRange[1].toLocaleString()}
                  </Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value: [number, number]) => handleFilterChange('priceRange', value)}
                    max={priceRange.max}
                    min={priceRange.min}
                    step={1000}
                    className="w-full"
                  />
                </div>

                <Separator />

                {/* Product Categories */}
                {availableCategories.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Product Categories</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={filters.productCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label 
                            htmlFor={`category-${category}`} 
                            className="text-sm cursor-pointer"
                          >
                            {getCategoryDisplayName(category)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Quick Actions */}
          <Select 
            value={filters.sortBy} 
            onValueChange={(value: any) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="response_time">Response Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground hidden md:inline-block">
          {filteredSellers.length} of {sellers.length} sellers
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => {
                  setSearchInput('');
                  handleFilterChange('searchQuery', '');
                }}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filters.availabilityStatus !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.availabilityStatus === 'online' ? 'Online' : 'Offline'}
              <button
                onClick={() => handleFilterChange('availabilityStatus', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.sellerType !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.sellerType.charAt(0).toUpperCase() + filters.sellerType.slice(1)}
              <button
                onClick={() => handleFilterChange('sellerType', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.minRating > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.minRating}★+ Rating
              <button
                onClick={() => handleFilterChange('minRating', 0)}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {activeFilterCount > 3 && (
            <Badge variant="outline" className="flex items-center gap-1">
              +{activeFilterCount - 3} more
              <button
                onClick={clearAllFilters}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerFilter;