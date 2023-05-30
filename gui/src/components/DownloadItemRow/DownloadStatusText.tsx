import { Text, TextProps, tokens } from '@fluentui/react-components'
import { DownloadStates, DownloadItem } from '../../downloadApi'

type DownloadStatusTextProps = Pick<DownloadItem, 'status' | 'errorMessage'> & TextProps

function DownloadStatusText({ status, errorMessage, ...textProps }: DownloadStatusTextProps) {
    if (status === DownloadStates.PAUSED) {
        return <Text {...textProps} style={{ color: tokens.colorNeutralForeground4 }}>Paused</Text>
    }

    if (status === DownloadStates.CANCELLED) {
        return <Text {...textProps} style={{ color: tokens.colorNeutralForeground4 }}>Cancelled</Text>
    }

    if (status === DownloadStates.ERROR) {
        return <Text {...textProps} style={{ color: tokens.colorPaletteRedBorderActive }}>Error{!!errorMessage ? `: ${errorMessage}` : ''}</Text>
    }

    if (status === DownloadStates.PENDING) {
        return <Text {...textProps} style={{ color: tokens.colorCompoundBrandForeground1 }}>Pending</Text>
    }

    return null
}

export default DownloadStatusText