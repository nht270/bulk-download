import { Button } from '@fluentui/react-components'
import { ArrowCounterclockwise24Regular, Delete24Regular, Dismiss24Regular, Pause24Regular, Play24Regular } from '@fluentui/react-icons'
import { DownloadItem, DownloadStates } from '../../downloadApi'
import useCancelDownload from '../../hooks/useCancelDownload'
import useDeleteDownload from '../../hooks/useDeleteDownload'
import usePauseDownload from '../../hooks/usePauseDownload'
import useResumeDownload from '../../hooks/useResumDownload'
import useRetryDownload from '../../hooks/useRetryDownload'

type DownloadButtonsProps = Pick<DownloadItem, 'id' | 'status'>
type DownloadButtonProps = Pick<DownloadItem, 'id'>

function DownloadButtons({ id, status }: DownloadButtonsProps) {

    if (status === DownloadStates.ERROR ||
        status === DownloadStates.CANCELLED) {
        return <>
            <RetryDownloadButton id={id} />
            <DeleteDownloadButton id={id} />
        </>
    }

    if (status === DownloadStates.DOWNLOADED) {
        return <DeleteDownloadButton id={id} />
    }

    if (status === DownloadStates.DOWNLOADING ||
        status === DownloadStates.PENDING) {
        return <>
            <PauseDownloadButton id={id} />
            <CancelDownloadButton id={id} />
        </>
    }

    if (status === DownloadStates.PAUSED) {
        return <>
            <ResumeDownloadButton id={id} />
            <CancelDownloadButton id={id} />
        </>
    }

    return null
}

function RetryDownloadButton({ id }: DownloadButtonProps) {
    const handleRetryDownload = useRetryDownload()

    return <Button
        appearance='subtle'
        icon={< ArrowCounterclockwise24Regular />}
        onClick={() => handleRetryDownload(id)}
    />
}

function CancelDownloadButton({ id }: DownloadButtonProps) {
    const handleCancelDownload = useCancelDownload()

    return <Button
        appearance='subtle'
        icon={<Dismiss24Regular />}
        onClick={() => handleCancelDownload(id)}
    />
}

function DeleteDownloadButton({ id }: DownloadButtonProps) {
    const handleDeleteDownload = useDeleteDownload()

    return <Button
        appearance='subtle'
        icon={< Delete24Regular />}
        onClick={() => handleDeleteDownload(id)}
    />
}

function PauseDownloadButton({ id }: DownloadButtonProps) {
    const handlePauseDownload = usePauseDownload()

    return <Button
        appearance='subtle'
        icon={<Pause24Regular />}
        onClick={() => handlePauseDownload(id)}
    />
}

function ResumeDownloadButton({ id }: DownloadButtonProps) {
    const handleResumeDownload = useResumeDownload()

    return <Button
        appearance='subtle'
        icon={<Play24Regular />}
        onClick={() => handleResumeDownload(id)}
    />
}

export default DownloadButtons