import { useMemo } from 'react'

const DEFAULT_DELAY = 400

type TDebounceFunc<TParams extends unknown[]> = (...args: TParams) => void

function useDebounce<TParams extends unknown[]>(func: TDebounceFunc<TParams>, delay = DEFAULT_DELAY) {
    const debouncedFunc = useMemo(() => {
        let timeoutId = 0
        return (...args: TParams) => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            timeoutId = window.setTimeout(() => {
                func(...args)
            }, delay)
        }
    }, [])

    return debouncedFunc
}

export default useDebounce