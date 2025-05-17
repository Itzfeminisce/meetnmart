import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn, formatCurrency, formatDuration, formatTimeAgo, getInitials } from '@/lib/utils';
import { Separator } from './ui/separator';
import { useNavigate } from 'react-router-dom';
import { Transaction, UserRole } from '@/contexts/AuthContext';
import { Button } from './ui/button';


interface Props {

    recentCall: Transaction['Returns'][number];
    role: UserRole
}
const RecentCallCard: React.FC<Props> = ({ recentCall: call, role }) => {
    const navigate = useNavigate()
    // Determine background color based on transaction status
    const getStatusBgColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'released':
                return 'bg-green-500/10';
            case 'disputed':
                return 'bg-red-500/10';
            case 'held':
                return 'bg-market-orange/10';
            default:
                return 'bg-market-blue/10';
        }
    };
    const getStatusTextColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'released':
                return 'text-green-500';
            case 'disputed':
                return 'text-red-500';
            case 'held':
                return 'text-market-orange';
            default:
                return 'text-market-blue';
        }
    };

    return (
        <Card key={call.transaction_id} className={cn('overflow-hidden', call.transaction_id && 'cursor-pointer')} onClick={() => call.transaction_id && navigate(`/transactions/${call.call_session_id}`)}>
            <CardContent className="p-0">
                {/* Main call details section */}
                <div className="flex items-center p-4">
                    <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={call.seller_avatar} />
                        <AvatarFallback>{getInitials(call.seller_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <p className="font-medium">{call.seller_name}</p>
                        {/* <p className="text-xs text-muted-foreground">{"call.category"}</p> */}
                    </div>
                    <div className="text-right">
                        <p className="font-medium">{formatDuration(call.duration)}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(call.transaction_created_at)}</p>
                    </div>
                </div>

                {/* Transaction details section (conditionally rendered) */}
                {call.transaction_id ? (
                    <>
                        <Separator />
                        <div className={`p-3 ${getStatusBgColor(call.status)}`}>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Ref:</span>
                                <span>{call.reference}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Amount:</span>
                                <span>{formatCurrency(call.amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-1">
                                <span className="text-muted-foreground">Status:</span>
                                <span className={`capitalize ${getStatusTextColor(call.status)}`}>{call.status}</span>
                            </div>

                            {role === "buyer" && call.status === "held" && (
                                <div className="w-full pt-4 flex items-center justify-end text-market-green text-sm">
                                    Open transaction to release funds
                                </div>
                            )}
                        </div>


                    </>
                ) : (
                    <>
                        <Separator />
                        <div className="p-4 w-full">
                            <h1 className='text-center'>No Transaction</h1>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentCallCard