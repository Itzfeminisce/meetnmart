import React from 'react'
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';

const NotificationPermissionCard = ({ instructions, onPermissionRequest }: { instructions: string; onPermissionRequest: () => Promise<boolean> }) => {
    return (
        <Card className="w-full max-w-md shadow-lg border-blue-600 border">
            <CardContent className="space-y-4 py-6 px-4">
                <div className="text-sm text-muted-foreground">
                    {(
                        <>
                            <p>
                                To get the most out of MeetnMart, enable notifications so we
                                can alert you when buyers are browsing your offers.
                            </p>
                            <p className="mt-2 font-medium text-black">
                                Stay ready. Sell faster.
                            </p>

                            <p className='font-bold text-base text-market-orange'>{instructions}</p>
                        </>
                    )}
                </div>

                <Button
                    variant='market'
                    onClick={onPermissionRequest}
                    className="w-full"
                >
                    Enable Notifications
                </Button>
            </CardContent>
        </Card>
    )
}

export default NotificationPermissionCard