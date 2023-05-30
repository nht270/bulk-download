import { useMemo } from 'react'
import DownloadApi, { DownloadItem, DownloadStates } from '../downloadApi'
import useDownloadItemSignal from './useDownloadItemSignal'
import useStore from './useStore'

function useCancelDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const handleCancelDownload = useMemo(() => {
        return async (...ids: string[]) => {
            const cancelledIds = await DownloadApi.cancelDownload(...ids)
            const oldDownloadItems = downloadItemsSignal.value
            const newDownloadItems: DownloadItem[] = []

            for (let item of oldDownloadItems) {
                if (cancelledIds.includes(item.id)) {
                    newDownloadItems.push({ ...item, status: DownloadStates.CANCELLED })
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

    return handleCancelDownload
}

export default useCancelDownload