import { signal } from '@preact/signals-react'
import { DownloadItem } from '../downloadApi'

const downloadItemsSignal = signal<DownloadItem[]>([])

function useDownloadItemSignal() {
    return downloadItemsSignal
}

export default useDownloadItemSignal