import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Clock,
    CreditCard,
    Calendar,
    User,
    Phone,
    CheckCircle,
    AlertCircle,
    Hourglass,
    FileText,
    Shield,
    LockOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DisputeForm } from '@/components/DisputeForm';
import { ReleaseConfirmation } from '@/components/ReleaseConfirmationModal';
import { formatCurrency, formatDate, formatDuration, formatTimeAgo } from '@/lib/utils';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Transaction, useAuth } from '@/contexts/AuthContext';
import Loader from './ui/loader';
import { useFetch, useGetTransactions } from '@/hooks/api-hooks';
import ErrorComponent from './ErrorComponent';




// Helper function to get status badge
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

const TransactionDetails = () => {
    const { user, userRole } = useAuth()
    const navigate = useNavigate();
    const { tx_id } = useParams() as { tx_id: string }
    const [showDisputeForm, setShowDisputeForm] = useState(false);
    const [showReleaseConfirmation, setShowReleaseConfirmation] = useState(false);
    const [transaction, setTransaction] = useState<Transaction['Returns'][number]>(null);



    if (!(tx_id && user)) navigate("/")


    let { data: trnx, isLoading: isLoadingTrx, error: trxErr } = useGetTransactions({ params: { user_id: user.id, session_id: tx_id } })



    useEffect(() => {
        if (!trnx) return;

        if (trnx && trnx.length > 0) {
            const [tranx] = trnx
            setTransaction({
                ...tranx,
                description: JSON.parse(tranx.description as undefined as string)
            })
        }

    }, [trnx, setTransaction])


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


    // Determine if user can release funds or file dispute
    // This would be based on user role and transaction state
    const status = transaction?.status?.toLowerCase() ?? '';
    const canReleaseFunds = status === 'held' && userRole === "buyer";
    const canFileDispute = !canReleaseFunds && !['released', 'disputed', 'rejected'].includes(status);

    if (trxErr) return <ErrorComponent error={trxErr} onRetry={() => navigate(0)}/>

    return (
        <div className="app-container px-4 pt-6 animate-fade-in mb-6">
            {/* Back button and header */}
            <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={handleBack} className="mr-2">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold">Transaction Details</h1>
            </div>
            {isLoadingTrx ? (
                <Loader />
            ) :  (
                transaction && (
                    <div className="grid gap-6">
                        {/* Top summary card */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Transaction ID</p>
                                        <CardTitle className="text-xl line-clamp-1">{transaction.transaction_id}</CardTitle>
                                    </div>
                                    <StatusBadge status={transaction.status} />
                                </div>
                            </CardHeader>

                            <CardContent className="pb-4">
                                <div className="flex flex-col md:flex-row justify-between">
                                    <div className="mb-4 md:mb-0">
                                        <h3 className="text-xl font-semibold mb-1">{transaction.description?.metadata.itemTitle}</h3>
                                        <p className="text-muted-foreground text-sm">{transaction.description?.metadata.itemDescription}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground">Amount</div>
                                        <div className="text-2xl font-bold text-primary">{formatCurrency(transaction.amount)}</div>
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
                                        <div className="font-medium">{formatTimeAgo(transaction.transaction_created_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Duration
                                        </div>
                                        <div className="font-medium">{formatDuration(transaction.duration)}</div>
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
                                        <div className="font-medium break-words">{transaction.reference}</div>
                                    </div>
                                </div>
                            </CardFooter>
                        </Card>


                        {/* Render dispute form or release confirmation if needed */}
                        {showDisputeForm && (
                            <DisputeForm
                                transactionId={transaction?.transaction_id}
                                onCancel={handleCancelForm}
                            />
                        )}

                        {/* {showReleaseConfirmation && ( */}
                        {
                            transaction && <ReleaseConfirmation
                                onOpenChange={setShowReleaseConfirmation}
                                open={!!showReleaseConfirmation}
                                transaction={transaction}
                                onCancel={handleCancelForm}
                            />
                        }
                        {/* )} */}

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
                                            <p className="font-medium">{formatDate(transaction.started_at)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ended</p>
                                            <p className="font-medium">{formatDate(transaction.ended_at)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Buyer</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                    <img src={transaction.buyer_avatar} alt="Buyer" />
                                                </div>
                                                <span className="font-medium">{transaction.buyer_name}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Seller</p>
                                            <div className="grid grid-cols-4 items-center gap-2 mt-1">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                                    <img src={transaction.seller_avatar} alt="Seller" />
                                                </div>
                                                <span className="font-medium col-span-3 truncate">{transaction.seller_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Additional details */}
                        {transaction.description.feedback && <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Additional Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Feedback:</p>
                                        <p className="mt-1">{transaction.description.feedback || "No Feedback"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>}

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
                )
            )}

        </div>
    );
};

export { TransactionDetails };