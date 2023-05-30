import { useMemo } from 'react'
import DownloadApi, { DownloadItem, DownloadStates } from '../downloadApi'
import useDownloadItemSignal from './useDownloadItemSignal'
import useStore from './useStore'

function usePauseDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const handlePauseDownload = useMemo(() => {
        return async (...ids: string[]) => {
            const pausedIds = await DownloadApi.pauseDownload(...ids)
            const oldDownloadItems = downloadItemsSignal.value
            const newDownloadItems: DownloadItem[] = []

            for (let item of oldDownloadItems) {
                if (pausedIds.includes(item.id)) {
                    newDownloadItems.push({ ...item, status: DownloadStates.PAUSED })
                } else {
                    newDownloadItems.push(item)
                }
            }

            dispatch({ type: 'download', payload: { downloadItems: newDownloadItems } })

            // assgin new download items to download items signal
            // because dispatch maybe not yet update
            downloadItemsSignal.value = newDownloadItems
        }
    }, [])

    return handlePauseDownload
}

export default usePauseDownload