import { makeStyles, tokens } from '@fluentui/react-components'

const useStyle = makeStyles({
    disable: {
        color: tokens.colorNeutralForegroundDisabled
    },
    powerSave: {
        color: tokens.colorPaletteSeafoamBorderActive
    },
    oneLine: {
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 1,
        overflowX: 'hidden',
        overflowY: 'hidden'
    },
    oneLineAndDisable: {
        color: tokens.colorNeutralForegroundDisabled,
        display: '-webkit-box',
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 1,
        overflowX: 'hidden',
        overflowY: 'hidden'
    },
    closeAppButton: {
        ':hover': {
            backgroundColor: tokens.colorPaletteRedBackground3,
        },
        ':hover svg': {
            color: tokens.colorNeutralForegroundStaticInverted
        }
    },
    resizeAppButton: {
        ':hover svg': {
            color: tokens.colorNeutralForeground1
        }
    }
})

export default useStyle