import { useEffect, useMemo, useState } from 'react'

interface ElementSize {
    height: number,
    width: number
}

function useElementSize<TElement extends HTMLElement>(ref: React.RefObject<TElement>) {
    const [size, setSize] = useState<ElementSize>({ height: 0, width: 0 })
    const observer = useMemo(() => {
        return new ResizeObserver(([entry]) => {
            if (!entry) { return }
            const { height, width } = entry.contentRect
            setSize({ height, width })
        })
    }, [])

    useEffect(() => {
        if (!ref.current) { return }
        const { clientHeight: height, clientWidth: width } = ref.current
        setSize({ height, width })

        observer.observe(ref.current)
        return () => {
            observer.disconnect()
        }
    }, [ref.current])

    return size
}

export default useElementSize