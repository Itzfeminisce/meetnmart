import React from 'react'

const MarketPlaceholder: React.FC<{ message: string }> = ({ message }) => {
    return (
        <>
            <div>MarketPlaceholder</div>
            <p>{message}</p>
        </>
    )
}

export {MarketPlaceholder}