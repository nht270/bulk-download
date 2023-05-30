import { Button, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Link, Text } from '@fluentui/react-components'
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons'
import { useState } from 'react'
import { DownloadStates } from '../../downloadApi'
import useDownloadFilter from '../../hooks/useDownloadFilter'
import useStore from '../../hooks/useStore'
import InputLinkForm from '../InputLinkForm'

function PowerSaveScreen() {
    const [, dispatch] = useStore()
    const downloadingItemCount = useDownloadFilter({ states: [DownloadStates.DOWNLOADING, DownloadStates.PENDING] }).length
    const [openAddDialog, setOpenAddDialog] = useState(false)
    return (
        <>
            <div className='power-save-screen'>
                <Text size={600}>This is power save mode</Text>
                <Link
                    onClick={() => dispatch({
                        type: 'powerSave',
                        payload: { isPowerSave: false }
                    })}
                >
                    <Text>Click here to back normal mode</Text>
                </Link>
                <br />
                <Text size={500}>
                    {downloadingItemCount > 1 ? `Downloading ${downloadingItemCount} files` : null}
                    {downloadingItemCount === 1 ? `Downloading a file` : null}
                    {downloadingItemCount === 0 ? `I'm free!` : null}
                </Text>
                <br />
                <Button
                    onClick={() => setOpenAddDialog(true)}
                    appearance='transparent'
                    icon={<Add24Regular />}
                >
                    Add download links
                </Button>
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
        </>

    )
}

export default PowerSaveScreen