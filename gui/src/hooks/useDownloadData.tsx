import { useLayoutEffect, useRef, useState } from 'react'
import DownloadApi, { DownloadStates, DownloadItem } from '../downloadApi'

function useDownloadData({ id, status, fileSize }: Pick<DownloadItem, 'id' | 'status' | 'fileSize'>) {

    const [downloadedSize, setDownloadedSize] = useState(0)
    const oldDownloadedSizeRef = useRef(0)
    const [bandwidth, setBanbwidth] = useState(0)
    const [remainSencond, setRemainSecond] = useState(0)

    useLayoutEffect(() => {
        if (status !== DownloadStates.DOWNLOADING) { return }
        DownloadApi.getDownloadedSize(id).then(downloadedSize => {
            setDownloadedSize(downloadedSize)
            setBanbwidth(downloadedSize - oldDownloadedSizeRef.current)
            oldDownloadedSizeRef.current = downloadedSize
        })
    }, [])

    useLayoutEffect(() => {
        if (status !== DownloadStates.DOWNLOADING) { return }

        // get difference between new size and old size in 1s
        const intervalId = setInterval(() => {
            DownloadApi.getDownloadedSize(id)
                .then(downloadedSize => {
                    setDownloadedSize(downloadedSize)
                    const bandwidth = downloadedSize - oldDownloadedSizeRef.current
                    setBanbwidth(bandwidth)
                    if (fileSize > 0 && bandwidth > 0) {
                        setRemainSecond((fileSize - downloadedSize) / bandwidth)
                    }
                    oldDownloadedSizeRef.current = downloadedSize
                })
        }, 1000)

        return () => clearInterval(intervalId)
    }, [status])

    return {
        downloadedSize,
        bandwidth,
        remainSencond
    }
}

export default useDownloadData