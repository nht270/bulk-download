/// <reference path="../../global.d.ts" />

import { Card, CardHeader, Text, mergeClasses } from '@fluentui/react-components'
import { DownloadStates, DownloadItem } from '../../downloadApi'
import useDownloadData from '../../hooks/useDownloadData'
import useStyle from '../../hooks/useStyle'
import DownloadButtons from './DownloadButtons'
import DownloadItemIcon from './DownloadItemIcon'
import DownloadItemTootip from './DownloadItemTooltip'
import DownloadOpenButtons from './DownloadOpenButton'
import DownloadProgressBar from './DownloadProgressBar'
import DownloadStatusText from './DownloadStatusText'
import MeasureDownloadText from './MeasureDownloadText'
import './index.scss'
import { memo } from 'react'

function DownloadItemRow(item: DownloadItem) {
    const { downloadedSize, bandwidth, remainSencond } = useDownloadData(item)
    const { disable: disableStyle, oneLine: oneLineStyle } = useStyle()
    const disableAndOnelineStyle = mergeClasses(disableStyle, oneLineStyle)

    return (
        <Card
            orientation='horizontal'
            appearance='subtle'
            style={{ width: '100%', userSelect: 'none' }}
        >
            <CardHeader
                image={
                    <DownloadItemIcon
                        type={item.fileType}
                        className={item.status === DownloadStates.CANCELLED ? disableStyle : ''}
                    />
                }
            />
            <div className="download-item">
                <DownloadItemTootip {...item}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Text
                            size={200}
                            weight='bold'
                            strikethrough={item.status === DownloadStates.CANCELLED}
                            className={
                                item.status === DownloadStates.CANCELLED
                                    ? disableAndOnelineStyle
                                    : oneLineStyle
                            }
                        >
                            {item.fileName}
                        </Text>
                    </div>
                </DownloadItemTootip>
                <DownloadProgressBar status={item.status} downloadedSize={downloadedSize} fileSize={item.fileSize} />
                <DownloadStatusText status={item.status} size={200} errorMessage={item.errorMessage} />
                {
                    item.status === DownloadStates.DOWNLOADED
                        ? <DownloadOpenButtons {...item} />
                        : null
                }
                {
                    item.status === DownloadStates.DOWNLOADING
                        ? <MeasureDownloadText
                            fileSize={item.fileSize}
                            bandwidth={bandwidth}
                            downloadedSize={downloadedSize}
                            remainSencond={remainSencond}
                        />
                        : null
                }

            </div>
            <DownloadButtons id={item.id} status={item.status} />
        </Card>
    )
}

export default memo(DownloadItemRow)