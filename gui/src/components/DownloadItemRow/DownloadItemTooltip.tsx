import { Button, Text, Tooltip } from '@fluentui/react-components'
import { DownloadItem } from '../../downloadApi'
import useCopyToClipboard from '../../hooks/useCopyToClipboard'
import Util from '../../util'
import React from 'react'

type DownloadItemTootipProps = DownloadItem & {
    children: JSX.Element
}

function DownloadItemTootip({ children, fileName, link, fileType, created, fileSize, folderPath }: DownloadItemTootipProps) {
    const [isCopied, copyToClipboard] = useCopyToClipboard()
    return (
        <Tooltip
            content={
                <div className='download-tooltip-wrap'>
                    <div className="download-tooltip-content">
                        <Text size={200} weight='bold'>File name: {fileName}</Text>
                        <Text size={200} style={{ wordBreak: 'break-word' }}>Link: {link}</Text>
                        <Text size={200}>Type: {fileType}</Text>
                        <Text size={200}>Size: {Util.transToRelativeDataSize(fileSize)}</Text>
                        <Text size={200} style={{ wordBreak: 'break-word' }}>Folder: {folderPath}</Text>
                        <Text size={200}>Created: {Util.toDateTimeText(created)}</Text>
                    </div>
                    <Button
                        onClick={() => copyToClipboard(link)}
                        size='small'
                    >
                        <Text size={200}>{isCopied ? 'COPIED' : 'COPY LINK'}</Text>
                    </Button>
                </div>
            }
            positioning={'above-start'}
            showDelay={500}
            relationship='description'
        >
            {children}
        </Tooltip>
    )
}

export default React.memo(DownloadItemTootip)