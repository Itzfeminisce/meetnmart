import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Clock, DollarSign } from 'lucide-react';
import { Transaction } from '@/types';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';


interface Props {
    transaction: Transaction;
}

const TransactionCard: React.FC<Props> = ({transaction: tx}) => {
    const navigate = useNavigate()

    return (
        <Card key={tx.id} className="overflow-hidden cursor-pointer" onClick={() => navigate(`/transactions/${tx.id}`)}>
            <CardContent className="p-0">
                <div className="flex items-center p-4">
                    <div className={`rounded-full p-2 mr-4 ${tx.type === 'escrow' ? 'bg-blue-100' : 'bg-green-100'}`}>
                        {tx.type === 'escrow' ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                        ) : (
                            <DollarSign className="h-5 w-5 text-green-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(tx.date.toISOString())}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-medium">{formatCurrency(tx.amount)}</p>
                        <p className={`text-xs ${tx.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                            {tx.status}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TransactionCard