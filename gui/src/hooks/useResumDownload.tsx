import { useMemo } from 'react'
import DownloadApi, { DownloadItem, DownloadStates } from '../downloadApi'
import useDownloadItemSignal from './useDownloadItemSignal'
import useStore from './useStore'

function useResumeDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const handleResumeDownload = useMemo(() => {
        return async (...ids: string[]) => {
            const pausedIds = await DownloadApi.resumeDownload(...ids)
            const oldDownloadItems = downloadItemsSignal.value
            const newDownloadItems: DownloadItem[] = []

            for (let item of oldDownloadItems) {
                if (item.status === DownloadStates.PAUSED && pausedIds.includes(item.id)) {
                    // set status is pending, 
                    // if download item is donwloaing, it will update by update download event 
                    newDownloadItems.push({ ...item, status: DownloadStates.PENDING })
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

    return handleResumeDownload
}

export default useResumeDownload