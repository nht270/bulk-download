import { useLayoutEffect } from 'react'
import DownloadApi, { DownloadItem } from '../downloadApi'
import useStore from './useStore'
import useDownloadItemSignal from './useDownloadItemSignal'

function useReceiveDownloadEvent() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    useLayoutEffect(() => {

        DownloadApi.onUpdateDownload((...downloadItems) => {
            const oldDownloadItems = downloadItemsSignal.value
            const updatedDownloadItemMap = new Map<string, DownloadItem>(
                downloadItems.map((item) => ([item.id, item]))
            )

            const newDownloadItems: DownloadItem[] = []

            for (let item of oldDownloadItems) {
                const updatedItem = updatedDownloadItemMap.get(item.id)
                newDownloadItems.push(updatedItem || item)
            }

            dispatch({ type: 'download', payload: { downloadItems: newDownloadItems } })

            // assgin new download items to download items signal
            // because dispatch maybe not yet update
            downloadItemsSignal.value = newDownloadItems
        })
    }, [])
}

export default useReceiveDownloadEvent