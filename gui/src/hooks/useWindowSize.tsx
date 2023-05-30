import { useLayoutEffect, useState } from 'react'

interface WindowSize {
    height: number,
    width: number
}

function useWindowSize() {
    const [windowsSize, setWindowSize] = useState<WindowSize>({
        height: window.innerHeight,
        width: window.innerWidth
    })

    useLayoutEffect(() => {
        function handleChangeWinddowSize() {
            setWindowSize({
                height: window.innerHeight,
                width: window.innerWidth
            })
        }

        window.addEventListener('resize', handleChangeWinddowSize)
        return () => {
            window.removeEventListener('resize', handleChangeWinddowSize)
        }
    }, [])

    return windowsSize
}

export default useWindowSize