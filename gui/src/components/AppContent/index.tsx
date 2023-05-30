import { Button, Card, CardHeader, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Spinner, Text } from '@fluentui/react-components'
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons'
import { useMemo, useState } from 'react'
import { DownloadStates, DownloadStatus } from '../../downloadApi'
import useLoadDownloadHistories from '../../hooks/useLoadDownloadHistories'
import useLoadAppConfig from '../../hooks/useLoadAppConfig'
import useReceiveDownloadEvent from '../../hooks/useReceiveDownloadEvents'
import useStore from '../../hooks/useStore'
import DownloadListPanel from '../DownloadListPanel'
import InputLinkForm from '../InputLinkForm'
import NavSearchForm from './NavSearchForm'
import NavTabList from './NavTabList'
import './index.scss'
import Util from '../../util'
import PowerSaveScreen from './PowerSaveScreen'

export interface DownloadFilters {
    states?: DownloadStatus[],
    search?: string,
    fileTypes?: string[],
    fromDate?: Date,
    toDate?: Date,
    fromSize?: number,
    toSize?: number,
    folderPaths?: string[]
}

function AppContent() {
    useLoadAppConfig()
    useReceiveDownloadEvent()
    const isLoadedHistories = useLoadDownloadHistories()
    const [globalState] = useStore()
    const [downloadFilters, setDownloadFilters] = useState<DownloadFilters>({})
    const [selectedTabName, setSelectedTabName] = useState('All')
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const handleTabSelect = useMemo(() => {
        return (tabValue: string) => {
            const downloadStates: DownloadStatus[] = []
            switch (tabValue) {
                case 'all':
                    downloadStates.push(
                        DownloadStates.DOWNLOADED,
                        DownloadStates.DOWNLOADING,
                        DownloadStates.PENDING,
                        DownloadStates.PAUSED,
                        DownloadStates.CANCELLED,
                        DownloadStates.ERROR
                    )
                    break
                case 'downloading':
                    // allow downloading tab includes pending status
                    downloadStates.push(
                        DownloadStates.DOWNLOADING,
                        DownloadStates.PENDING
                    )
                    break
                case 'downloaded':
                    downloadStates.push(DownloadStates.DOWNLOADED)
                    break
                case 'pending':
                    downloadStates.push(DownloadStates.PENDING)
                    break
                case 'paused':
                    downloadStates.push(DownloadStates.PAUSED)
                    break
                case 'cancelled':
                    downloadStates.push(DownloadStates.CANCELLED)
                    break
                case 'error':
                    downloadStates.push(DownloadStates.ERROR)
                    break
                default:
                    break
            }
            setSelectedTabName(Util.capitalizeFirtLetter(tabValue))
            setDownloadFilters(prev => ({ ...prev, states: downloadStates }))
        }
    }, [])

    if (!isLoadedHistories) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100dvh - 2rem)'   // 2rem is height of tittle abr
                }}>
                <Spinner size='huge' />
            </div>
        )
    }

    if (globalState.isPowerSave) {
        return <PowerSaveScreen />
    }

    if (globalState.downloadItems.length <= 0) {
        return (
            <div className="app-content">
                <div className="input-links-form">
                    <InputLinkForm />
                </div>
            </div>
        )
    }

    return (
        <div className="app-content">
            <div className="app-content__nav">
                <NavSearchForm
                    filters={downloadFilters}
                    onSubmit={(filters) => {
                        setDownloadFilters(prev => ({ ...prev, ...filters }))
                    }}

                    onChangeSearchText={(text) => {
                        setDownloadFilters(prev => ({ ...prev, search: text }))
                    }}
                />
                <NavTabList onTabSelect={handleTabSelect} />
            </div>
            <div className="app-content__download-list-panel">
                <div className="download-list-panel__header">
                    <Card appearance='subtle'>
                        <CardHeader
                            header={<Text size={600}>{selectedTabName}</Text>}
                            action={
                                <Button
                                    icon={<Add24Regular />}
                                    shape='circular'
                                    appearance='subtle'
                                    onClick={() => setOpenAddDialog(true)}
                                />
                            }
                        />
                    </Card>
                </div>
                <div className="download-list-panel__list">
                    <DownloadListPanel downloadFilters={downloadFilters} />
                </div>
            </div>
            <Dialog
                open={openAddDialog}
                onOpenChange={(_e, { open }) => setOpenAddDialog(open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle
                            action={
                                <DialogTrigger action='close'>
                                    <Button
                                        icon={<Dismiss24Regular />}
                                        appearance='subtle'
                                    />
                                </DialogTrigger>}
                        >
                            Input links
                        </DialogTitle>
                        <DialogContent>
                            <InputLinkForm onSubmited={() => setOpenAddDialog(false)} />
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    )
}

export default AppContent