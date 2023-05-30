import { Image, ImageProps } from '@fluentui/react-components'
import useAutoChangeEmoji from '../../hooks/useAutoChangeEmoji'

function EmojiAutoChange(props: ImageProps) {
    const { emojiPath } = useAutoChangeEmoji()

    return <Image {...props} src={emojiPath} />
}

export default EmojiAutoChange