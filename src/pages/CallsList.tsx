import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RecentCallCard from '@/components/RecentCallCard';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';
import { useFetch } from '@/hooks/api-hooks';

type Status = "status:completed" | "status:held" | "status:rejected"
type SortOption = 'date-asc' | 'date-desc' | 'duration-asc' | 'duration-desc' | Status;

const CallsList = () => {
    const { user, fetchTransactions, userRole } = useAuth()
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');

    const {data: allCalls, isLoading: isLoadingTrx, error:trxErr } = useFetch(['transactions'], () => fetchTransactions({ user_id: user.id }))

    const [filteredCalls, setFilteredCalls] = useState<Awaited<ReturnType<typeof fetchTransactions>>>([]);

    // Apply filters and sorting whenever search term or sort option changes
    useEffect(() => {
        // Start with all calls
        let results = [...allCalls];
        
        // Apply search filter
        if (searchTerm) {
            results = results.filter(call =>
                call.seller_name.toLowerCase().includes(searchTerm.toLowerCase())
                // Add other search criteria if needed
                // || call.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply status filter
        if (sortOption.startsWith("status")) {
            const status = sortOption.split(":")[1];
            results = results.filter(call => call.status === status);
        }
        
        // Apply sorting
        results.sort((a, b) => {
            switch (sortOption) {
                case 'date-asc':
                    return new Date(a?.transaction_created_at).getTime() - new Date(b?.transaction_created_at).getTime();
                case 'date-desc':
                    return new Date(b?.transaction_created_at).getTime() - new Date(a?.transaction_created_at).getTime();
                case 'duration-asc':
                    return a.duration?.localeCompare(b.duration);
                case 'duration-desc':
                    return b.duration?.localeCompare(a.duration);
                default:
                    return 0;
            }
        });
        
        setFilteredCalls(results);
    }, [searchTerm, sortOption, allCalls]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortOption('date-desc');
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
                    <div>
                        <h1 className="text-2xl font-bold text-gradient">Recent calls</h1>
                        <p className="text-sm text-muted-foreground">
                            {filteredCalls.length} total
                        </p>
                    </div>
                </div>
            </header>

            <div className="space-y-4 mb-4">
                {/* Search and Filter section */}
                <div className="flex flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by seller or category..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="shrink-0">
                                <Filter className="mr-2 h-4 w-4" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortOption('date-desc')}>
                                Date (Newest first)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('date-asc')}>
                                Date (Oldest first)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('duration-desc')}>
                                Duration (Longest first)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('duration-asc')}>
                                Duration (Shortest first)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:rejected')}>
                                Rejected
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:held')}>
                                Held
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:completed')}>
                                Completed
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-3">
                    {isLoadingTrx ? (
                        <Loader />
                    ) : trxErr ? (
                        <p>{trxErr as string}</p>
                    ) : (
                        !trxErr && filteredCalls.length === 0 ? (
                            <div className="w-full flex flex-col gap-4 mx-auto justify-center align-center text-center py-4">
                                <p>No transactions found.</p>
                                <Button size="sm" onClick={handleClearFilters}>Clear Filters</Button>
                            </div>
                        ) : filteredCalls.map((call, idx) => (
                            <RecentCallCard role={userRole} key={idx} recentCall={call} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CallsList;