
import React from 'react'

type MarketPlaceholderProps = {
    message: string;
}

const MarketPlaceholder = ({ message }: MarketPlaceholderProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-4 text-muted-foreground">🏪</div>
            <p className="text-lg text-muted-foreground">{message}</p>
        </div>
    )
}

export { MarketPlaceholder }
