import { Switch, Toolbar, ToolbarButton, ToolbarGroup, Tooltip } from '@fluentui/react-components'
import { ArrowCounterclockwise24Regular, Delete24Regular, Dismiss24Regular, Pause24Regular, Play24Regular } from '@fluentui/react-icons'
import { useRef, useState } from 'react'
import useCancelDownload from '../../hooks/useCancelDownload'
import useDeleteDownload from '../../hooks/useDeleteDownload'
import useDownloadFilter from '../../hooks/useDownloadFilter'
import usePauseDownload from '../../hooks/usePauseDownload'
import useResumeDownload from '../../hooks/useResumDownload'
import useRetryDownload from '../../hooks/useRetryDownload'
import useWindowSize from '../../hooks/useWindowSize'
import { DownloadFilters } from '../AppContent'
import DownloadList from '../DownloadList'
import './index.scss'

interface DownloadListPanelProps {
    downloadFilters: DownloadFilters
}

function DownloadListPanel({ downloadFilters }: DownloadListPanelProps) {
    const [isSelectionItem, setIsSelectionItem] = useState(false)
    const selectedIdsRef = useRef<string[]>([])
    const windowSize = useWindowSize()
    const isOverflowToolbar = windowSize.width < 950
    const filteredDownloadItems = useDownloadFilter(downloadFilters)
    const handleRetryDownload = useRetryDownload()
    const handleDeleteDownload = useDeleteDownload()
    const handleCancelDownload = useCancelDownload()
    const handleResumeDownload = useResumeDownload()
    const handlePauseDownload = usePauseDownload()

    return (
        <div>
            <Toolbar style={{ justifyContent: 'space-between' }}>
                <ToolbarGroup>
                    <Switch label={'Select item'} onChange={(_e, data) => setIsSelectionItem(data.checked)} />
                </ToolbarGroup>
                <ToolbarGroup>
                    <Tooltip
                        content={'Retry'}
                        relationship='label'
                    >
                        <ToolbarButton
                            appearance='subtle'
                            icon={<ArrowCounterclockwise24Regular />}
                            onClick={() => handleRetryDownload(...selectedIdsRef.current)}
                            disabled={!isSelectionItem}
                        >
                            {isOverflowToolbar ? null : 'Retry'}
                        </ToolbarButton>
                    </Tooltip>
                    <Tooltip
                        content={'Cancel'}
                        relationship='label'
                    >
                        <ToolbarButton
                            appearance='subtle'
                            icon={<Dismiss24Regular />}
                            onClick={() => handleCancelDownload(...selectedIdsRef.current)}
                            disabled={!isSelectionItem}
                        >
                            {isOverflowToolbar ? null : 'Cancel'}
                        </ToolbarButton>
                    </Tooltip>
                    <Tooltip
                        content={'Delete'}
                        relationship='label'
                    >
                        <ToolbarButton
                            appearance='subtle'
                            icon={<Delete24Regular />}
                            onClick={() => handleDeleteDownload(...selectedIdsRef.current)}
                            disabled={!isSelectionItem}
                        >
                            {isOverflowToolbar ? null : 'Delete'}
                        </ToolbarButton>
                    </Tooltip>
                    <Tooltip
                        content={'Pause'}
                        relationship='label'
                    >
                        <ToolbarButton
                            appearance='subtle'
                            icon={<Pause24Regular />}
                            onClick={() => handlePauseDownload(...selectedIdsRef.current)}
                            disabled={!isSelectionItem}
                        >
                            {isOverflowToolbar ? null : 'Pause'}
                        </ToolbarButton>
                    </Tooltip>
                    <Tooltip
                        content={'Resume'}
                        relationship='label'
                    >
                        <ToolbarButton
                            appearance='subtle'
                            icon={<Play24Regular />}
                            onClick={() => handleResumeDownload(...selectedIdsRef.current)}
                            disabled={!isSelectionItem}
                        >
                            {isOverflowToolbar ? null : 'Resume'}
                        </ToolbarButton>
                    </Tooltip>
                </ToolbarGroup>
            </Toolbar>
            <DownloadList
                downloadItems={filteredDownloadItems}
                showSelection={isSelectionItem}
                onSelectItems={(ids) => selectedIdsRef.current = ids}
            />
        </div>
    )
}

export default DownloadListPanel