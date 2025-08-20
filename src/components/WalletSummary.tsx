import React, { useMemo } from 'react';
import { TrendingUp, Lock, Calendar, History, BanknoteIcon } from 'lucide-react';
import { useAuth, UserRole, type WalletSummary } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

interface WalletSummaryProps {
    // walletSummary: WalletSummary;
    userRole: UserRole;
}


const WalletSummary: React.FC<WalletSummaryProps> = ({ userRole = "seller" }) => {
    const {wallet}  = useAuth()

    // const cards = useMemo(() => {
    //    return [
    //         ...(userRole === "seller" && [
    //             {
    //                 title: "This Month",
    //                 value: walletSummary.monthly_balance,
    //                 icon: <Calendar className="h-5 w-5 text-violet-500" />,
    //                 color: "bg-violet-50 dark:bg-violet-900/20",
    //                 textColor: "text-violet-600 dark:text-violet-400"
    //             }
    //         ]),
    //         {
    //             title: "Month Escrow",
    //             value: walletSummary.monthly_escrowed,
    //             icon: <Lock className="h-5 w-5 text-amber-500" />,
    //             color: "bg-amber-50 dark:bg-amber-900/20",
    //             textColor: "text-amber-600 dark:text-amber-400"
    //         },
    //     ];
    // }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium flex items-center mb-4">
                <span className="bg-market-orange/20 w-1 h-5 mr-2"></span>
                Balance Overview
            </h2>


            {/* Top Stats - Current Balances */}
            <div className="grid grid-cols-2 gap-4 md:flex md:space-x-4">
                <div className="rounded-xl border bg-card p-4 shadow-sm flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">Available</p>
                        <BanknoteIcon className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(wallet.balance)}</p>
                </div>
                <div className="rounded-xl border bg-card p-4 shadow-sm flex-1">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">In Escrow</p>
                        <Lock className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(wallet.escrowed_balance)}</p>
                </div>
            </div>

            {/* Stats Grid */}
            {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {cards.map((card, index) => (
                    <div key={index} className={`rounded-xl p-4 ${card.color}`}>
                        <div className="flex items-center justify-between">
                            <div className="rounded-full bg-white p-2 shadow-sm">
                                {card.icon}
                            </div>
                        </div>
                        <p className={`mt-3 text-lg font-bold ${card.textColor}`}>
                            {formatCurrency(card.value)}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                            {card.title}
                        </p>
                    </div>
                ))}
            </div> */}
        </div>
    );
};

export { WalletSummary };