import { useEffect, useMemo, useRef } from 'react'

type DebounceFunction<T extends (...args: any[]) => any> = {
    (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>>
    cancel: () => void
    flush: () => Promise<ReturnType<T>>
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param options Optional configuration
 * @param options.leading Specify invoking on the leading edge of the timeout
 * @param options.trailing Specify invoking on the trailing edge of the timeout
 * @param options.maxWait The maximum time `func` is allowed to be delayed before it's invoked
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options?: {
        leading?: boolean
        trailing?: boolean
        maxWait?: number
    }
): DebounceFunction<T> {
    let lastArgs: Parameters<T> | null = null
    let lastThis: ThisParameterType<T> | null = null
    let result: Promise<ReturnType<T>> | null = null
    let timerId: ReturnType<typeof setTimeout> | null = null
    let lastCallTime: number | null = null
    let lastInvokeTime = 0

    const { leading = false, trailing = true, maxWait } = options || {}

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function')
    }

    wait = +wait || 0

    async function invokeFunc(time: number) {
        const args = lastArgs
        const thisArg = lastThis

        lastArgs = null
        lastThis = null
        lastInvokeTime = time
        if (args) {
            result = Promise.resolve(func.apply(thisArg, args))
        }
        return result
    }

    function leadingEdge(time: number) {
        lastInvokeTime = time
        timerId = setTimeout(timerExpired, wait)
        return leading ? invokeFunc(time) : result
    }

    function remainingWait(time: number) {
        if (lastCallTime === null) return wait
        const timeSinceLastCall = time - (lastCallTime || 0)
        const timeSinceLastInvoke = time - lastInvokeTime
        const timeWaiting = wait - timeSinceLastCall

        return maxWait !== undefined
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting
    }

    function shouldInvoke(time: number) {
        if (lastCallTime === null) return true
        const timeSinceLastCall = time - (lastCallTime || 0)
        return timeSinceLastCall >= wait ||
            (maxWait !== undefined && time - lastInvokeTime >= maxWait)
    }

    function timerExpired() {
        const time = Date.now()
        if (shouldInvoke(time)) {
            return trailingEdge(time)
        }
        timerId = setTimeout(timerExpired, remainingWait(time))
    }

    function trailingEdge(time: number) {
        timerId = null
        if (trailing && lastArgs) {
            return invokeFunc(time)
        }
        lastArgs = null
        lastThis = null
        return result
    }

    function cancel() {
        if (timerId !== null) {
            clearTimeout(timerId)
        }
        lastInvokeTime = 0
        lastArgs = null
        lastThis = null
        timerId = null
    }

    async function flush() {
        return timerId === null ? result : trailingEdge(Date.now())
    }

    async function debounced(this: ThisParameterType<T>, ...args: Parameters<T>) {
        const time = Date.now()
        const isInvoking = shouldInvoke(time)

        lastArgs = args
        lastThis = this
        lastCallTime = time

        if (isInvoking) {
            if (timerId === null) {
                return leadingEdge(lastCallTime)
            }
            if (maxWait !== undefined) {
                timerId = setTimeout(timerExpired, wait)
                return invokeFunc(lastCallTime)
            }
        }
        if (timerId === null) {
            timerId = setTimeout(timerExpired, wait)
        }
        return result
    }

    debounced.cancel = cancel
    debounced.flush = flush

    return debounced
}
/**
 * Debounce hook for React
 * 
 * @param callback The function to debounce
 * @param delay The debounce delay in milliseconds
 * @param options Optional configuration
 * @param options.leading Call on leading edge
 * @param options.trailing Call on trailing edge
 * @param options.maxWait Maximum wait time
 */
export function useDebounce<T extends (...args: any[]) => any>(
    callback: T,
    delay: number,
    options?: {
        leading?: boolean
        trailing?: boolean
        maxWait?: number
    }
): DebounceFunction<T> {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const debouncedFn = useMemo(() => {
        return debounce(
            (...args: Parameters<T>) => callbackRef.current(...args),
            delay,
            options
        )
    }, [delay, options?.leading, options?.trailing, options?.maxWait])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            debouncedFn.cancel()
        }
    }, [debouncedFn])

    return debouncedFn
}