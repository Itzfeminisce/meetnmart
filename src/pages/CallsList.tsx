import React, { PropsWithChildren, useEffect, useState } from 'react';
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
import { useFetch, useGetTransactions } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';
import AppHeader from '@/components/AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';

type Status = "status:initiated" | "status:pending" | "status:held" | "status:delivered" | "status:confirmed" | "status:released" | "status:disputed" | "status:refunded" | "status:rejected";
type SortOption = 'date-asc' | 'date-desc' | 'duration-asc' | 'duration-desc' | Status;

const CallsList = () => {
    const { user, fetchTransactions, userRole } = useAuth()
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const isMobile = useIsMobile()

    const { data: allCalls, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user.id } })

    const [filteredCalls, setFilteredCalls] = useState<Awaited<ReturnType<typeof fetchTransactions>>>([]);

    // Apply filters and sorting whenever search term or sort option changes
    useEffect(() => {
        if (!allCalls) return
        // Start with all calls
        let results = [...allCalls];

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            results = results.filter(call =>
                call.seller_name?.toLowerCase().includes(searchLower) ||
                call.buyer_name?.toLowerCase().includes(searchLower) ||
                call.category?.toLowerCase().includes(searchLower) ||
                call.description?.toLowerCase().includes(searchLower)
            );
        }

        // Apply status filter
        if (sortOption.startsWith("status:")) {
            const status = sortOption.split(":")[1];
            results = results.filter(call => call.status === status);
        }

        // Apply sorting (only if not filtering by status)
        if (!sortOption.startsWith("status:")) {
            results.sort((a, b) => {
                switch (sortOption) {
                    case 'date-asc':
                        return new Date(a?.transaction_created_at || 0).getTime() - new Date(b?.transaction_created_at || 0).getTime();
                    case 'date-desc':
                        return new Date(b?.transaction_created_at || 0).getTime() - new Date(a?.transaction_created_at || 0).getTime();
                    case 'duration-asc':
                        // Convert duration strings to numbers for proper comparison
                        const aDuration = parseDuration(a.duration);
                        const bDuration = parseDuration(b.duration);
                        return aDuration - bDuration;
                    case 'duration-desc':
                        const aDurationDesc = parseDuration(a.duration);
                        const bDurationDesc = parseDuration(b.duration);
                        return bDurationDesc - aDurationDesc;
                    default:
                        return 0;
                }
            });
        } else {
            // If filtering by status, still sort by date (newest first)
            results.sort((a, b) =>
                new Date(b?.transaction_created_at || 0).getTime() - new Date(a?.transaction_created_at || 0).getTime()
            );
        }

        setFilteredCalls(results);
    }, [searchTerm, sortOption, allCalls]);

    // Helper function to parse duration string to seconds for comparison
    const parseDuration = (duration: string | undefined): number => {
        if (!duration) return 0;

        // Handle different duration formats (e.g., "5:30", "1:05:30", "30s", etc.)
        const timeMatch = duration.match(/(\d+):(\d+)(?::(\d+))?/);
        if (timeMatch) {
            const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
            const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
            const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
            return hours * 3600 + minutes * 60 + seconds;
        }

        // Handle seconds format
        const secondsMatch = duration.match(/(\d+)s?/);
        if (secondsMatch) {
            return parseInt(secondsMatch[1]);
        }

        return 0;
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSortOption('date-desc');
    };

    if (trxErr) return <ErrorComponent error={trxErr} onRetry={() => navigate(0)} />

    return (
        <>
            <AppHeader
                title="Recent calls"
                subtitle={`${filteredCalls.length} total`}
                showBackButton
                onBackClick={() => navigate(-1)}
                search={{
                    onSearch: setSearchTerm,
                    onClear: () => setSearchTerm("")
                }}
                rightContent={
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size={isMobile ? "icon" : "default"} variant="ghost" className="shrink-0">
                                <Filter className="h-4 w-4" />
                                <span className='hidden md:inline-block'>{sortOption.startsWith('status:') ? 'Filter' : 'Sort'}</span>
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
                            <DropdownMenuItem onClick={() => setSortOption('status:pending')}>
                                Status: Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:held')}>
                                Status: Held
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:disputed')}>
                                Status: Disputed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOption('status:rejected')}>
                                Status: Rejected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            />
            <div className="container animate-fade-in mb-[5rem]">
                <div className="space-y-4 mb-4">
                    {/* Show active filters */}
                    {(searchTerm || sortOption !== 'date-desc') && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Active filters:</span>
                            {searchTerm && (
                                <span className="bg-secondary px-2 py-1 rounded text-xs">
                                    Search: "{searchTerm}"
                                </span>
                            )}
                            {sortOption !== 'date-desc' && (
                                <span className="bg-secondary px-2 py-1 rounded text-xs">
                                    {sortOption.startsWith('status:')
                                        ? `Status: ${sortOption.split(':')[1]}`
                                        : `Sort: ${sortOption}`
                                    }
                                </span>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFilters}
                                className="text-xs h-6 px-2"
                            >
                                Clear all
                            </Button>
                        </div>
                    )}

                    <div className="space-y-3">
                        {isLoadingTrx ? (
                            <Loader />
                        ) : (
                            !trxErr && filteredCalls.length === 0 ? (
                                <div className="w-full flex flex-col gap-4 mx-auto justify-center align-center text-center py-8">
                                    <p className="text-muted-foreground">
                                        {searchTerm || sortOption !== 'date-desc'
                                            ? 'No calls match your current filters.'
                                            : 'No transactions found.'}
                                    </p>
                                    {(searchTerm || sortOption !== 'date-desc') && (
                                        <Button size="sm" onClick={handleClearFilters}>
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            ) : filteredCalls.map((call, idx) => (
                                <RecentCallCard role={userRole} key={call.call_session_id || idx} recentCall={call} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CallsList;