import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Explore = () => {
    const navigate = useNavigate();
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
                    <h1 className="text-2xl font-bold text-gradient">Explore</h1>
                </div>
                <p className="text-muted-foreground">Discover markets, products, and shopping lists in your area</p>
            </header>
            <div className="text-center max-w-md">
                <div className="mb-6 flex justify-center">
                    <div className="rounded-full bg-market-blue/10 p-4">
                        <Clock size={48} className="text-market-blue" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-3 text-gradient">Explore Coming Soon</h1>

                <p className="text-muted-foreground mb-6">
                    We're building a new way for you to discover markets, products, and shopping lists in your area.
                    Check back soon for personalized recommendations and trending items!
                </p>

                <div className="glass-morphism p-4 rounded-lg">
                    <p className="text-sm">
                        <span className="font-medium">What to expect:</span> Market discovery, trending products,
                        curated shopping lists, and local recommendations tailored just for you.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Explore;