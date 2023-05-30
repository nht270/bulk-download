import { Text } from '@fluentui/react-components'
import Util from '../../util'

interface MeasureDownloadText {
    fileSize: number,
    downloadedSize: number,
    bandwidth: number,
    remainSencond: number
}

function MeasureDownloadText({ downloadedSize, bandwidth, remainSencond, fileSize }: MeasureDownloadText) {

    let measureText = `${Util.transToRelativeBandwidth(bandwidth)} - ${Util.transToRelativeDataSize(downloadedSize)}`

    if (fileSize > 0) {
        measureText += ` of ${Util.transToRelativeDataSize(fileSize)}, left ${Util.transToRelativeTime(remainSencond * 1000)}`
    }

    return (
        <Text size={200}>
            {measureText}
        </Text>
    )
}

export default MeasureDownloadText