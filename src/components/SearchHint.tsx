import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Search } from 'lucide-react';

interface SearchHintProps {
    query: string;
    metadata?: {
        source: string
    }
}

export const SearchHint: React.FC<SearchHintProps> = ({ query, metadata }) => {
    const navigate = useNavigate();
    
    return (
        <Card className="mt-4 bg-secondary/50 border-dashed">
            <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-market-orange/10">
                            <Compass className="h-5 w-5 text-market-orange" />
                        </div>
                        <div>
                            <h3 className="font-medium">
                                No results found for "{query}"
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Expand your search to find more results
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`,{
                            state: metadata
                        })}
                        className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        <span>Expand your search</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};