import { useMemo } from 'react'
import { DownloadFilters } from '../components/AppContent'
import Util from '../util'
import useStore from './useStore'

function useDownloadFilter(filters: DownloadFilters) {
    const [globalState] = useStore()

    const filteredDownloadItems = useMemo(() => {
        const checkDownloadItem = Util.createDownloadItemFilter(filters)
        return globalState.downloadItems.filter(checkDownloadItem)
    }, [globalState.downloadItems, filters])

    return filteredDownloadItems
}

export default useDownloadFilter