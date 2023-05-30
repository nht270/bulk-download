import { useMemo } from 'react'
import useStore from './useStore'
import useDownloadItemSignal from './useDownloadItemSignal'
import DownloadApi, { DownloadRequest } from '../downloadApi'

function useRetryDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()

    const handleRetryDownload = useMemo(() => {
        return async (...ids: string[]) => {
            const itemsWouldRetry = downloadItemsSignal.value.filter(item => ids.includes(item.id))
            const downloadRequests: DownloadRequest[] = itemsWouldRetry.map(({ link, folderPath }) => ({ link, saveFolder: folderPath }))
            const retriedDownloadItems = await DownloadApi.addDownload(downloadRequests)
            const newDownloadItems = [
                ...retriedDownloadItems,
                ...downloadItemsSignal.value
            ]
            dispatch({ type: 'download', payload: { downloadItems: newDownloadItems } })
            downloadItemsSignal.value = newDownloadItems
        }
    }, [])

    return handleRetryDownload
}

export default useRetryDownload