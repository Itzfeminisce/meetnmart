
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { categories } from '@/lib/mockData';
import { Market } from '@/types';

const CategorySelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { market } = location.state as { market: Market };

  const handleCategorySelect = (categoryId: string) => {
    navigate('/sellers', { 
      state: { market, categoryId } 
    });
  };

  return (
    <div className="app-container px-4 pt-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-2 -ml-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-gradient">{market.name}</h1>
        </div>
        <p className="text-muted-foreground">Select a category to find sellers</p>
      </header>
      
      <div className="grid grid-cols-2 gap-4">
        {categories.map(category => {
          const bgColorClass = `bg-${category.color}/10`;
          const textColorClass = `text-${category.color}`;
          
          return (
            <div
              key={category.id}
              className="glass-morphism rounded-xl p-4 flex flex-col items-center text-center card-hover"
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className={`w-16 h-16 ${bgColorClass} rounded-full flex items-center justify-center mb-3`}>
                <span className="text-3xl">{category.icon}</span>
              </div>
              <h3 className={`font-medium ${textColorClass}`}>{category.name}</h3>
            </div>
          );
        })}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CategorySelection;
