import { Button, Text } from '@fluentui/react-components'
import { ArrowMinimize16Regular, Dismiss16Regular, LeafOne16Regular, Settings16Regular, Square16Regular, SquareMultiple16Regular, WeatherMoon16Regular, WeatherSunny16Regular, WindowDevTools16Regular } from '@fluentui/react-icons'
import { useMemo, useState } from 'react'
import AppApi from '../../appApi'
import DevApi from '../../devApi'
import DownloadApi from '../../downloadApi'
import { AppConfig } from '../../global'
import useCancelDownload from '../../hooks/useCancelDownload'
import useStore from '../../hooks/useStore'
import useStyle from '../../hooks/useStyle'
import useTheme from '../../hooks/useTheme'
import Util from '../../util'
import EmojiAutoChange from '../EmojiAutoChange'
import NoCompleteWarningDialog from '../NoCompleteWarningDialog'
import SettingDialog from '../SettingDialog'
import './index.scss'

function TitleBar() {
    const { staticThemeName, toggleTheme } = useTheme()
    const [{ isPowerSave }, dispatch] = useStore()
    const [openSettingForm, setOpenSettingDialog] = useState(false)
    const [openNoCompleteDialog, setOpenNoCompleteDialog] = useState(false)
    const [noCompleteCount, setNoCompleteCount] = useState(0)
    const [isFullWindow, setIsFullScreen] = useState(Util.checkFullWindow())
    const {
        powerSave: powerSaveStyle,
        closeAppButton: closeAppButtonStyle,
        resizeAppButton: resizeAppButtonStyle
    } = useStyle()
    const handleCancelDownload = useCancelDownload()

    const {
        handleSubmitSettingForm,
        handleClickCloseButton,
        handleConfirmNoCompleteDialog
    } = useMemo(() => {
        async function handleSubmitSettingForm(config: AppConfig) {
            setOpenSettingDialog(false)
            const newConfig = await AppApi.updateConfig(config)
            if (!newConfig) { return }
            AppApi.changeTheme(newConfig.theme)
            dispatch({ type: 'setting', payload: { config: newConfig } })
        }

        async function handleClickCloseButton() {
            const noCompleteCount = await DownloadApi.getNoDownloadCount()

            if (noCompleteCount <= 0) {
                AppApi.closeWindow()
            } else {
                setNoCompleteCount(noCompleteCount)
                setOpenNoCompleteDialog(true)
            }
        }

        async function handleConfirmNoCompleteDialog() {
            await handleCancelDownload()
            AppApi.closeWindow()
            setOpenNoCompleteDialog(false)
        }

        return {
            handleSubmitSettingForm,
            handleClickCloseButton,
            handleConfirmNoCompleteDialog
        }
    }, [])
    return (
        <>
            <div className='title-bar'>
                <div className="title-bar__title">
                    <EmojiAutoChange height={24} width={24} />
                    <Text size={500}>Bulk Download</Text>
                </div>
                <div className="draggable"></div>
                <div className="title-bar__button-wrap">
                    <div className="custom-button-wrap">
                        <Button
                            appearance='subtle'
                            shape='circular'
                            size='small'
                            icon={
                                staticThemeName === 'light'
                                    ? <WeatherSunny16Regular color='yellow' />
                                    : <WeatherMoon16Regular color='white' />
                            }
                            onClick={toggleTheme}
                        />
                        <Button
                            appearance='subtle'
                            shape='circular'
                            size='small'
                            icon={
                                <LeafOne16Regular className={isPowerSave ? powerSaveStyle : ''} />
                            }
                            onClick={() => {
                                dispatch({
                                    type: 'powerSave',
                                    payload: { isPowerSave: !isPowerSave }
                                })
                            }}
                        />
                        <Button
                            appearance='subtle'
                            shape='circular'
                            icon={<Settings16Regular />}
                            size='small'
                            onClick={() => setOpenSettingDialog(true)}
                        />
                        {
                            import.meta.env.DEV
                                ? (
                                    <Button
                                        onClick={() => { DevApi.toggleDevTool() }}
                                        appearance='subtle'
                                        shape='circular'
                                        icon={<WindowDevTools16Regular />}
                                    />)
                                : null
                        }
                    </div>
                    <div className="default-button-wrap">
                        <Button
                            shape='square'
                            appearance='subtle'
                            icon={<ArrowMinimize16Regular />}
                            className={resizeAppButtonStyle}
                            onClick={() => AppApi.minimiseWindow()}
                        >
                        </Button>
                        <Button
                            shape='square'
                            appearance='subtle'
                            icon={
                                isFullWindow
                                    ? <SquareMultiple16Regular />
                                    : <Square16Regular />
                            }
                            className={resizeAppButtonStyle}
                            onClick={() => {
                                if (isFullWindow) {
                                    AppApi.restoreWindow()
                                } else {
                                    AppApi.maximiseWindow()
                                }
                                setIsFullScreen(prev => !prev)
                            }}
                        >
                        </Button>
                        <Button
                            appearance='subtle'
                            shape='square'
                            icon={<Dismiss16Regular />}
                            className={closeAppButtonStyle}
                            onClick={handleClickCloseButton}
                        >
                        </Button>
                    </div>
                </div>
            </div>
            <SettingDialog
                open={openSettingForm}
                onOpenChange={(_e, { open }) => setOpenSettingDialog(open)}
                onSubmitSettingForm={handleSubmitSettingForm}
                onCancelSettingForm={() => setOpenSettingDialog(false)}
            />
            <NoCompleteWarningDialog
                open={openNoCompleteDialog}
                noCompleteCount={noCompleteCount}
                onOpenChange={(_e, { open }) => setOpenNoCompleteDialog(open)}
                onConfirm={handleConfirmNoCompleteDialog}
            />
        </>
    )
}

export default TitleBar