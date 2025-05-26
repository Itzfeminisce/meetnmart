import { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, Search, Package, CheckCircle, ShoppingCart, Coffee, Shirt, Utensils, Gamepad2, Home, Heart, Baby, Car, Book, Music, Camera, Flower, Apple, Wrench, Paintbrush, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

type Category = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  popular: boolean;
};

const categories: Category[] = [
  { id: '1', name: 'Food & Beverages', icon: Coffee, description: 'Fresh food, drinks, snacks', color: 'bg-orange-500/10 text-orange-600', popular: true },
  { id: '2', name: 'Clothing & Fashion', icon: Shirt, description: 'Apparel, accessories, jewelry', color: 'bg-purple-500/10 text-purple-600', popular: true },
  { id: '3', name: 'Electronics', icon: Gamepad2, description: 'Gadgets, phones, computers', color: 'bg-blue-500/10 text-blue-600', popular: false },
  { id: '4', name: 'Home & Garden', icon: Home, description: 'Furniture, decor, plants', color: 'bg-green-500/10 text-green-600', popular: true },
  { id: '5', name: 'Health & Beauty', icon: Heart, description: 'Skincare, wellness, cosmetics', color: 'bg-pink-500/10 text-pink-600', popular: true },
  { id: '6', name: 'Baby & Kids', icon: Baby, description: 'Toys, clothes, baby gear', color: 'bg-yellow-500/10 text-yellow-600', popular: false },
  { id: '7', name: 'Automotive', icon: Car, description: 'Car parts, accessories, tools', color: 'bg-gray-500/10 text-gray-600', popular: false },
  { id: '8', name: 'Books & Media', icon: Book, description: 'Books, music, movies', color: 'bg-indigo-500/10 text-indigo-600', popular: false },
  { id: '9', name: 'Sports & Outdoors', icon: Star, description: 'Equipment, gear, apparel', color: 'bg-teal-500/10 text-teal-600', popular: true },
  { id: '10', name: 'Art & Crafts', icon: Paintbrush, description: 'Handmade, supplies, artwork', color: 'bg-rose-500/10 text-rose-600', popular: false },
  { id: '11', name: 'Tools & Hardware', icon: Wrench, description: 'Tools, hardware, supplies', color: 'bg-slate-500/10 text-slate-600', popular: false },
  { id: '12', name: 'Fresh Produce', icon: Apple, description: 'Fruits, vegetables, organic', color: 'bg-lime-500/10 text-lime-600', popular: true },
];

const SellerCategorySelection = () => {
    const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMarkets] = useState(['Market Plaza', 'Downtown Square']); // Mock selected markets

  const filteredCategories = useMemo(() => {
    if (searchQuery.length === 0) return categories;
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const popularCategories = useMemo(() => 
    filteredCategories.filter(cat => cat.popular), 
    [filteredCategories]
  );

  const otherCategories = useMemo(() => 
    filteredCategories.filter(cat => !cat.popular), 
    [filteredCategories]
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleContinue = () => {
    // Navigate to seller dashboard/waiting page
    console.log('Selected categories:', selectedCategories);
    console.log('Selected markets:', selectedMarkets);
  };

  const handleBack = () => {
    navigate(-1)
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gradient">Choose Your Categories</h1>
        <p className="text-muted-foreground">Select what types of products you'll be selling</p>
      </header>

      {/* Selected Markets Summary */}
      <Card className="mb-6 bg-market-blue/5 border-market-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-market-blue mb-1">
                Selected Markets ({selectedMarkets.length})
              </h3>
              <div className="flex gap-2 flex-wrap">
                {selectedMarkets.map((market, index) => (
                  <Badge key={index} variant="secondary" className="bg-market-blue/10 text-market-blue">
                    {market}
                  </Badge>
                ))}
              </div>
            </div>
            <CheckCircle className="h-5 w-5 text-market-blue" />
          </div>
        </CardContent>
      </Card>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-none"
          />
        </div>
      </div>

      {/* Selection Summary */}
      {selectedCategories.length > 0 && (
        <Card className="mb-6 bg-market-orange/10 border-market-orange/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-market-orange">
                  {selectedCategories.length} categor{selectedCategories.length !== 1 ? 'ies' : 'y'} selected
                </h3>
                <p className="text-sm text-muted-foreground">
                  Buyers will find you in these categories
                </p>
              </div>
              <CheckCircle className="h-5 w-5 text-market-orange" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-medium flex items-center">
              <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
              Popular Categories
            </h2>
            <Badge variant="secondary" className="bg-market-orange/10 text-market-orange">
              Most Active
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {popularCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onToggle={handleCategoryToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Categories */}
      {otherCategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium flex items-center mb-4">
            <span className="bg-market-blue/20 w-1 h-5 mr-2"></span>
            All Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {otherCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategories.includes(category.id)}
                onToggle={handleCategoryToggle}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No categories found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 sticky bottom-[4rem] bg-background/95 backdrop-blur-sm pt-4 border-t">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={selectedCategories.length === 0}
          className="w-full bg-market-orange hover:bg-market-orange/90"
        >
          Start Selling
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You can update your categories anytime from your seller dashboard
        </p>
      </div>
    </div>
  );
};

const CategoryCard = ({ 
  category, 
  isSelected, 
  onToggle 
}: { 
  category: Category; 
  isSelected: boolean; 
  onToggle: (id: string) => void; 
}) => {
  const IconComponent = category.icon;

  return (
    <div
      className={`glass-morphism rounded-lg p-4 cursor-pointer transition-all group ${
        isSelected
          ? 'ring-2 ring-market-orange bg-market-orange/5'
          : 'hover:bg-secondary/30'
      }`}
      onClick={() => onToggle(category.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 rounded-lg ${category.color}`}>
          <IconComponent className="h-6 w-6" />
        </div>
        
        <div className="flex-shrink-0">
          {isSelected ? (
            <CheckCircle className="h-5 w-5 text-market-orange animate-pop-in" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-market-orange/30 transition-colors" />
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-sm mb-1">{category.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {category.description}
        </p>
      </div>

      {category.popular && (
        <Badge 
          variant="secondary" 
          className="mt-3 bg-market-orange/10 text-market-orange text-xs"
        >
          Popular
        </Badge>
      )}
    </div>
  );
};

export default SellerCategorySelection;