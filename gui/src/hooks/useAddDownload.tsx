import { useMemo } from 'react'
import DownloadApi, { DownloadRequest } from '../downloadApi'
import useStore from './useStore'
import useDownloadItemSignal from './useDownloadItemSignal'

function useAddDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const handleAddDownload = useMemo(() => {
        return async (requests: DownloadRequest[]) => {
            const addedDownloadItems = await DownloadApi.addDownload(requests)
            const oldDownloadItems = downloadItemsSignal.value
            const newDownloadItems = [
                ...addedDownloadItems,
                ...oldDownloadItems
            ]
            dispatch({ type: 'download', payload: { downloadItems: newDownloadItems } })

            // assgin new download items to download items signal
            // because dispatch maybe not yet update
            downloadItemsSignal.value = newDownloadItems
        }
    }, [])

    return handleAddDownload
}

export default useAddDownload