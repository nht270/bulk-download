import { useMemo, useState } from 'react'

function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false)
    const copyToClipboard = useMemo(() => {
        function copyToClipboard(text: string) {
            setIsCopied(false)
            window.navigator.clipboard.writeText(text).then(() => {
                setIsCopied(true)
            })
        }

        return copyToClipboard
    }, [])

    return [isCopied, copyToClipboard] as const
}

export default useCopyToClipboard