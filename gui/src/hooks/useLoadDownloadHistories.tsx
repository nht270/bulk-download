import { useEffect, useState } from 'react'
import DownloadApi from '../downloadApi'
import useDownloadItemSignal from './useDownloadItemSignal'
import useStore from './useStore'

function useLoadDownloadHistories() {
    const [, dispatch] = useStore()
    const downloadItemsSignal = useDownloadItemSignal()
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        DownloadApi.getDownloadHistories()
            .then((downloadHistories) => {
                dispatch({ type: 'download', payload: { downloadItems: downloadHistories } })
                downloadItemsSignal.value = downloadHistories
            })
            .finally(() => {
                setIsLoaded(true)
            })
    }, [])

    return isLoaded
}

export default useLoadDownloadHistories