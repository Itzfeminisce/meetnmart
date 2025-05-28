import { useDebounce } from "@/hooks/use-debounce"
import React, { useEffect, useState } from "react"
import { Input } from "./input"

interface DebouncedInputProps {
    onChangeText: (query: string) => void;
    placeholder: string;
}

export const DebouncedInput: React.FC<DebouncedInputProps> = ({ onChangeText, placeholder }) => {
    const [query, setQuery] = useState('')

    const debouncedSearch = useDebounce(onChangeText, 500)

    useEffect(() => {
        debouncedSearch(query)
    }, [query, debouncedSearch])

    return (
        <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-secondary/50 border-none"
        />
    )
}