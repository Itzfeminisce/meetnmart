import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Search, Filter, Clock, CreditCard, Calendar,
    User, Phone, CheckCircle, AlertCircle, Hourglass,
    FileText, Shield, LockOpen, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';
import { useGetTransactions } from '@/hooks/api-hooks';
import ErrorComponent from '@/components/ErrorComponent';
import { cn, formatCurrency, formatDate, formatDuration, formatTimeAgo } from '@/lib/utils';
import { DisputeForm } from '@/components/DisputeForm';
import { ReleaseConfirmation } from '@/components/ReleaseConfirmationModal';
import { ExpandedTransaction } from '@/types';
import CustomDialog from '@/components/ui/custom-dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import RecentCallCard from '@/components/RecentCallCard';

type Status = "status:initiated" | "status:pending" | "status:held" | "status:delivered" | "status:confirmed" | "status:released" | "status:disputed" | "status:refunded" | "status:rejected";
type SortOption = 'date-asc' | 'date-desc' | 'duration-asc' | 'duration-desc' | Status;

const StatusBadge = ({ status }) => {
    const statusConfig = {
        'released': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-4 w-4" /> },
        'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <Hourglass className="h-4 w-4" /> },
        'rejected': { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="h-4 w-4" /> },
        'disputed': { color: 'bg-purple-100 text-purple-800', icon: <Shield className="h-4 w-4" /> },
        'escrow': { color: 'bg-blue-100 text-blue-800', icon: <LockOpen className="h-4 w-4" /> }
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

    return (
        <Badge className={`${config.color} flex items-center gap-1 py-1 px-2`}>
            {config.icon}
            <span className="capitalize">{status}</span>
        </Badge>
    );
};

const Transactions = () => {
    const { user, userRole } = useAuth();
    const navigate = useNavigate();
    const { tx_id } = useParams() as { tx_id: string };
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>('date-desc');
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [showReleaseConfirmation, setShowReleaseConfirmation] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<ExpandedTransaction>(null);
    const isMobile = useIsMobile()


    const { data: allCalls, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user.id } });
    const [filteredCalls, setFilteredCalls] = useState([]);

    // Apply filters and sorting
    useEffect(() => {
        if (!allCalls) return;

        let results = [...allCalls];

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            results = results.filter(call =>
                call.seller_name?.toLowerCase().includes(searchLower) ||
                call.buyer_name?.toLowerCase().includes(searchLower) ||
                // call.category?.toLowerCase().includes(searchLower) ||
                call.description?.metadata?.itemTitle?.toLowerCase().includes(searchLower)
            );
        }

        if (sortOption.startsWith("status:")) {
            const status = sortOption.split(":")[1];
            results = results.filter(call => call.status === status);
        }

        if (!sortOption.startsWith("status:")) {
            results.sort((a, b) => {
                switch (sortOption) {
                    case 'date-asc':
                        return new Date(a?.transaction_created_at || 0).getTime() - new Date(b?.transaction_created_at || 0).getTime();
                    case 'date-desc':
                        return new Date(b?.transaction_created_at || 0).getTime() - new Date(a?.transaction_created_at || 0).getTime();
                    case 'duration-asc':
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
            results.sort((a, b) =>
                new Date(b?.transaction_created_at || 0).getTime() - new Date(a?.transaction_created_at || 0).getTime()
            );
        }

        setFilteredCalls([...results.filter(it => it.reference)]);
        // setFilteredCalls(results);

        // Auto-select transaction if tx_id is in URL
        if (tx_id && results.length > 0) {
            const selected = results.find(call => call.call_session_id === tx_id);
            if (selected) {
                setSelectedTransaction({
                    ...selected,
                    // @ts-ignore
                    description: JSON.parse(selected.description)
                });
            }
        }
    }, [searchTerm, sortOption, allCalls, tx_id]);

    const parseDuration = (duration: string | undefined): number => {
        if (!duration) return 0;

        const timeMatch = duration.match(/(\d+):(\d+)(?::(\d+))?/);
        if (timeMatch) {
            const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
            const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
            const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
            return hours * 3600 + minutes * 60 + seconds;
        }

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


    const handleTransactionSelect = (transaction) => {
        setSelectedTransaction({
            ...transaction,
            description: JSON.parse(transaction.description)
        });
        navigate(`/transactions/${transaction.call_session_id}`, { replace: !isMobile });
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleDisputeClick = () => {
        setShowDisputeForm(true);
        setShowReleaseConfirmation(false);
    };

    const handleReleaseClick = () => {
        setShowReleaseConfirmation(true);
        setShowDisputeForm(false);
    };

    const handleCancelForm = () => {
        setShowDisputeForm(false);
        setShowReleaseConfirmation(false);
    };

    if (trxErr) return <ErrorComponent error={trxErr} onRetry={() => navigate(0)} />;

    // Determine if user can release funds or file dispute
    const status = selectedTransaction?.status?.toLowerCase() ?? '';
    const canReleaseFunds = status === 'held' && userRole === "buyer";
    const canFileDispute = !canReleaseFunds && !['released', 'disputed', 'rejected'].includes(status);

    return (
        <>
            <div className="min-h-screen bg-background py-4 md:py-6 animate-fade-in mb-[5rem]">
                <div className="container mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-6">
                        <Button variant="ghost" onClick={handleBack} className="mr-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-2xl font-bold">Transactions</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Calls List */}
                        <div className="lg:col-span-1 space-y-4">
                            {/* Search and Filter */}
                            <div className="flex flex-row gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search transactions..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="shrink-0">
                                            <Filter className="mr-2 h-4 w-4" />
                                            {sortOption.startsWith('status:') ? 'Filter' : 'Sort'}
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
                            </div>

                            {/* Active filters */}
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
                                                : `Sort: ${sortOption}`}
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

                            {/* Transactions List */}
                            <div className="space-y-2">
                                {isLoadingTrx ? (
                                    <Loader />
                                ) : filteredCalls.length === 0 ? (
                                    <div className="w-full flex flex-col gap-4 mx-auto justify-center align-center text-center py-8">
                                        <p className="text-muted-foreground">
                                            {searchTerm || sortOption !== 'date-desc'
                                                ? 'No transactions match your current filters.'
                                                : 'No transactions found.'}
                                        </p>
                                        {(searchTerm || sortOption !== 'date-desc') && (
                                            <Button size="sm" onClick={handleClearFilters}>
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    filteredCalls.map((call) => (
                                        <RecentCallCard role={'seller'} key={call.transaction_id} recentCall={call} />
                                        // <Card
                                        //     key={call.call_session_id}
                                        //     className={cn(call.reference ? 'cursor-pointer transition-all' : 'cursor-not-allowed', selectedTransaction?.call_session_id === call.call_session_id ? 'ring-2 ring-market-orange' : 'hover:bg-secondary/50')}
                                        //     onClick={() => call.reference && handleTransactionSelect(call)}
                                        // >
                                        //     <CardContent className="p-4">
                                        //         <div className="flex items-center">
                                        //             <div className={`rounded-full p-2 mr-4 ${call.type === 'escrow' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                        //                 {call.type === 'escrow' ? (
                                        //                     <Clock className="h-5 w-5 text-blue-600" />
                                        //                 ) : (
                                        //                     <DollarSign className="h-5 w-5 text-green-600" />
                                        //                 )}
                                        //             </div>
                                        //             <>
                                        //                 <div className="flex-1">
                                        //                     <p className="font-medium">{call.buyer_name || call.seller_name}</p>
                                        //                     <p className="text-xs text-muted-foreground">
                                        //                         {call.reference ? formatTimeAgo(call.transaction_created_at) : "No transaction"}
                                        //                     </p>
                                        //                 </div>
                                        //                 {
                                        //                     call.reference && (
                                        //                         <div className="text-right">
                                        //                             <p className="font-medium">{formatCurrency(call.amount)}</p>
                                        //                             <StatusBadge status={call.status} />
                                        //                         </div>
                                        //                     )
                                        //                 }
                                        //             </>
                                        //         </div>
                                        //     </CardContent>
                                        // </Card>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right Column - Transaction Details */}
                        {<TransactionDetailMobileView
                            selectedTransaction={selectedTransaction}
                            canFileDispute={canFileDispute}
                            canReleaseFunds={canReleaseFunds}
                            handleDisputeClick={handleDisputeClick}
                            handleReleaseClick={handleReleaseClick}
                        />}
                    </div>
                </div>
            </div>

            {/* Render dispute form or release confirmation if needed */}
            {showDisputeForm && selectedTransaction && (
                <DisputeForm
                    transactionId={selectedTransaction?.transaction_id}
                    onCancel={handleCancelForm}
                />
            )}

            {/* {showReleaseConfirmation && ( */}
            {
                selectedTransaction && <ReleaseConfirmation
                    onOpenChange={setShowReleaseConfirmation}
                    open={!!showReleaseConfirmation}
                    transaction={selectedTransaction}
                    onCancel={handleCancelForm}
                />
            }
        </>
    );
};

interface TransactionDetailProps {
    selectedTransaction: ExpandedTransaction;
    handleDisputeClick: () => void;
    handleReleaseClick: () => void;
    canReleaseFunds: boolean;
    canFileDispute: boolean;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ selectedTransaction, canFileDispute, canReleaseFunds, handleDisputeClick, handleReleaseClick }) => {
    return (
        <div className="lg:col-span-2">
            {selectedTransaction ? (
                <div className="grid gap-6">
                    {/* Top summary card */}
                    <Card className="shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                                    <CardTitle className="text-xl line-clamp-1">{selectedTransaction.transaction_id}</CardTitle>
                                </div>
                                <StatusBadge status={selectedTransaction.status} />
                            </div>
                        </CardHeader>

                        <CardContent className="pb-4">
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h3 className="text-xl font-semibold mb-1">{selectedTransaction.description?.metadata?.itemTitle}</h3>
                                    <p className="text-muted-foreground text-sm">{selectedTransaction.description?.metadata?.itemDescription}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">Amount</div>
                                    <div className="text-2xl font-bold text-primary">{formatCurrency(selectedTransaction.amount)}</div>
                                </div>
                            </div>
                        </CardContent>

                        {/* Action buttons */}
                        {(canReleaseFunds || canFileDispute) && (
                            <div className="flex items-center justify-end gap-2 p-4 flex-wrap">
                                {canFileDispute && (
                                    <Button
                                        type='button'
                                        size='sm'
                                        onClick={handleDisputeClick}
                                        variant="destructive"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        File Dispute
                                    </Button>
                                )}

                                {canReleaseFunds && (
                                    <Button
                                        variant='secondary'
                                        type='button'
                                        size='sm'
                                        onClick={handleReleaseClick}
                                        className='bg-market-orange/70 hover:bg-market-orange/50'
                                    >
                                        <LockOpen className="h-4 w-4 mr-2" />
                                        Release Funds
                                    </Button>
                                )}
                            </div>
                        )}

                        <Separator />

                        <CardFooter className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full">
                                <div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date
                                    </div>
                                    <div className="font-medium">{formatTimeAgo(selectedTransaction.transaction_created_at)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> Duration
                                    </div>
                                    <div className="font-medium">{formatDuration(selectedTransaction.duration)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" /> Payment
                                    </div>
                                    <div className="font-medium">{"Escrow"}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <FileText className="h-3 w-3" /> Order Ref
                                    </div>
                                    <div className="font-medium break-words">{selectedTransaction.reference}</div>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Call details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Call Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Started</p>
                                        <p className="font-medium">{formatDate(selectedTransaction.started_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ended</p>
                                        <p className="font-medium">{formatDate(selectedTransaction.ended_at)}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Buyer</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                <img src={selectedTransaction.buyer_avatar} alt="Buyer" />
                                            </div>
                                            <span className="font-medium">{selectedTransaction.buyer_name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Seller</p>
                                        <div className="grid grid-cols-4 items-center gap-2 mt-1">
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                <img src={selectedTransaction.seller_avatar} alt="Seller" />
                                            </div>
                                            <span className="font-medium col-span-3 truncate">{selectedTransaction.seller_name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional details */}
                    {selectedTransaction.description?.feedback && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Feedback:</p>
                                        <p className="mt-1">{selectedTransaction.description.feedback || "No Feedback"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Help information */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Need help with this transaction?</AlertTitle>
                        <AlertDescription>
                            If you have any questions or need assistance with this transaction, please contact our
                            support team at info@meetnmart.com or through the help center.
                        </AlertDescription>
                    </Alert>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transaction selected</h3>
                    <p className="text-muted-foreground">Select a transaction from the list to view details</p>
                </div>
            )}
        </div>
    )
}

const TransactionDetailMobileView: React.FC<{ selectedTransaction: ExpandedTransaction; } & TransactionDetailProps> = ({ selectedTransaction, ...transactionDetailProps }) => {
    const isMobile = useIsMobile()
    const [isOpen, setIsOpen] = useState(!!selectedTransaction)
    const navigate = useNavigate()
    const { tx_id } = useParams() as { tx_id: string };

    useEffect(() => {
        setIsOpen(!!tx_id)
    }, [tx_id])

    return (
        isMobile && selectedTransaction ? <CustomDialog
        className='p-0 m-0'
            dialogTitle={selectedTransaction.description.metadata.itemTitle}
            onOpenChange={setIsOpen}
            onCancel={() => navigate(-1)}
            open={isOpen}
            showSubmitButton={false}>
            <TransactionDetail {...transactionDetailProps} selectedTransaction={selectedTransaction} />
        </CustomDialog>

            : <TransactionDetail {...transactionDetailProps} selectedTransaction={selectedTransaction} />
    )
}

export default Transactions;