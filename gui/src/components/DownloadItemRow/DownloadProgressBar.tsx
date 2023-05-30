import { ProgressBar } from '@fluentui/react-components'
import { DownloadStates, DownloadItem } from '../../downloadApi'

type DownloadProgressBarProps = Pick<DownloadItem, 'status' | 'fileSize'> & {
    downloadedSize: number
}

function DownloadProgressBar({ status, fileSize, downloadedSize }: DownloadProgressBarProps) {

    if (status === DownloadStates.CANCELLED ||
        status === DownloadStates.ERROR ||
        status === DownloadStates.DOWNLOADED) {
        return null
    }

    if (status === DownloadStates.PAUSED && fileSize === 0) {
        return <ProgressBar thickness='medium' value={0} max={1} />
    }

    if (status === DownloadStates.PENDING || fileSize === 0) {
        return <ProgressBar thickness='medium' />
    }


    return <ProgressBar thickness='medium' value={downloadedSize} max={fileSize} />
}

export default DownloadProgressBar