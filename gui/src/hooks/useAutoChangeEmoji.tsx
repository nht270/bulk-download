import { useEffect, useMemo, useState } from 'react'

export class Emojis {
    #emojiPaths = [
        "./emojis/grinning_face_with_smiling_eyes_3d.png",
        "./emojis/pile_of_poo_3d.png",
        "./emojis/pleading_face_3d.png",
        "./emojis/folded_hands_3d_medium-dark.png",
        "./emojis/smiling_face_with_hearts_3d.png",
        "./emojis/fire_3d.png",
        "./emojis/face_with_tears_of_joy_3d.png",
        "./emojis/red_heart_3d.png",
        "./emojis/crying_face_3d.png",
        "./emojis/loudly_crying_face_3d.png",
        "./emojis/airplane_3d.png",
        "./emojis/face_screaming_in_fear_3d.png",
        "./emojis/smiling_face_with_sunglasses_3d.png",
        "./emojis/smiling_face_with_heart-eyes_3d.png",
        "./emojis/smiling_face_with_smiling_eyes_3d.png",
        "./emojis/smiling_face_with_tear_3d.png",
        "./emojis/biting_lip_3d.png",
        "./emojis/peach_3d.png",
        "./emojis/sweat_droplets_3d.png"
    ]

    #currentEmojiIndex = 0

    current() {
        return this.#emojiPaths[this.#currentEmojiIndex]
    }

    next() {
        if (this.#currentEmojiIndex < this.#emojiPaths.length - 1) {
            this.#currentEmojiIndex ++
        } else {
            this.#currentEmojiIndex = 0
        }

        return this.current()
    }

    previous() {
        if (this.#currentEmojiIndex > 0) {
            this.#currentEmojiIndex --
        } else {
            this.#currentEmojiIndex = this.#emojiPaths.length - 1
        }

        return this.current()
    }

    random() {
        const randomIndex = Math.floor(Math.random() * this.#emojiPaths.length)
        return this.#emojiPaths[randomIndex]
    }
}

type ChangeType = 'next' | 'previous' | 'random'
const DEFAULT_CHANGE_EMOJI_TIME = 1500

function useAutoChangeEmoji(type: ChangeType = 'next', changeTime = DEFAULT_CHANGE_EMOJI_TIME) {
    const emojis = useMemo(() => new Emojis(), [])
    const [emojiPath, setEmojiPath] = useState(emojis.current())

    useEffect(() => {
        const intervalId = setInterval(() => {
            switch (type) {
                case 'next':
                    setEmojiPath(emojis.next())
                    break
                case 'previous':
                    setEmojiPath(emojis.previous())
                    break
                case 'random':
                    setEmojiPath(emojis.random())
                    break
            }
        }, changeTime)

        return () => clearInterval(intervalId)
    }, [type])

    return { emojiPath }
}

export default useAutoChangeEmoji