import { useMemo } from 'react'
import DownloadApi, { DownloadItem } from '../downloadApi'
import useDownloadItemSignal from './useDownloadItemSignal'
import useStore from './useStore'

function useDeleteDownload() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const handleDeleteDownload = useMemo(() => {
        console.log('create delete')
        return async (...ids: string[]) => {
            const deletedIds = await DownloadApi.deleteDownload(...ids)
            console.log({ deletedIds })
            const oldDownloadItems = downloadItemsSignal.value
            const newDownloadItems: DownloadItem[] = []

            for (let item of oldDownloadItems) {
                if (!deletedIds.includes(item.id)) {
                    newDownloadItems.push(item)
                }
            }

            dispatch({ type: 'download', payload: { downloadItems: newDownloadItems } })

            // assgin new download items to download items signal
            // because dispatch maybe not yet update
            downloadItemsSignal.value = newDownloadItems
        }
    }, [])

    return handleDeleteDownload
}

export default useDeleteDownload