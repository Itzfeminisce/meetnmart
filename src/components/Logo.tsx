import { cn } from '@/lib/utils'
import React from 'react'
import { Link } from 'react-router-dom'
import { ClassNameValue } from 'tailwind-merge'

interface LogoProps {containerClassName?: ClassNameValue}

const Logo: React.FC<LogoProps> = ({containerClassName}) => {
    return (
        <div className={cn("w-12 h-12 md:w-16 md:h-1/6 overflow-hidden relative", containerClassName)}>
            <Link to="/" className="flex items-center">
                <img src="/logo-white.png" alt="MeertnMart Logo" className='w-full object-fill' />
            </Link>

            
            <span
      className={cn(
        "text-[10px] uppercase font-semibold rounded-full border text-market-orange bg-orange-100 dark:bg-orange-900/30",
      "absolute bottom-2 right-[10%] md:right-[10%] bg-market-orange text-white font-bold px-2" )}
    >
      Beta
    </span>
        </div>
    )
}

export default Logo