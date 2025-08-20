import { useDebounce } from "@/hooks/use-debounce"
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'onChange'> {
    onChangeText: (query: string) => void;
    delay?: number;
    className?: string;
    showSearchIcon?: boolean;
    isMobile?: boolean;
}

export interface DebouncedInputRef {
    clear: () => void;
    focus: () => void;
    getQuery: () => string;
}

export const DebouncedInput = forwardRef<DebouncedInputRef, DebouncedInputProps>(
    ({ className, onChangeText, delay = 500, placeholder, showSearchIcon = true, isMobile = false, ...props }, ref) => {
        const [query, setQuery] = useState(props.defaultValue?.toString() ?? '')
        const inputRef = useRef<HTMLInputElement>(null)

        const debouncedSearch = useDebounce(onChangeText, delay)

        useEffect(() => {
            debouncedSearch(query)
        }, [query, debouncedSearch])

        useImperativeHandle(ref, () => ({
            clear: () => {
                setQuery('')
                onChangeText('')
            },
            focus: () => {
                inputRef.current?.focus()
            },
            getQuery() {
                return query;
            },
        }))

        return (
            <div className="relative w-full">
                {showSearchIcon && (
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                <Input
                    ref={inputRef}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={cn(
                        'w-full pl-10 pr-4 py-2 bg-muted rounded-sm focus:outline-none focus:ring-2 focus:ring-ring text-sm',
                        showSearchIcon ? 'pl-10' : 'pl-4',
                        isMobile && "pr-10 py-3",
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)

DebouncedInput.displayName = "DebouncedInput"