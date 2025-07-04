import { cn } from '@/lib/utils'
import React from 'react'
import { Link } from 'react-router-dom'
import { ClassNameValue } from 'tailwind-merge'

interface LogoProps {containerClassName: ClassNameValue}

const Logo: React.FC<LogoProps> = ({containerClassName}) => {
    return (
        <div className={cn("w-12 h-12 md:w-16 md:h-1/6 overflow-hidden", containerClassName)}>
            <Link to="/" className="flex items-center">
                <img src="/logo-white.png" alt="MeertnMart Logo" className='w-full object-fill' />
            </Link>
        </div>
    )
}

export default Logo