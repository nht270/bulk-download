import { Apps24Regular, Document24Regular, HeadphonesSoundWave24Regular, Image24Regular, SlideText24Regular, Video24Regular } from '@fluentui/react-icons'

interface DownloadItemIconProps {
    type: string,
    className?: string
}

function DownloadItemIcon({ type, className }: DownloadItemIconProps) {

    switch (type) {
        case 'image':
            return <Image24Regular className={className} />
        case 'text':
            return <SlideText24Regular className={className} />
        case 'video':
            return <Video24Regular className={className} />
        case 'application':
            return <Apps24Regular className={className} />
        case 'audio':
            return <HeadphonesSoundWave24Regular className={className} />
    }

    return <Document24Regular className={className} />
}

export default DownloadItemIcon