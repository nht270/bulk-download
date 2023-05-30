import { Button, DialogProps, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Text } from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
type NoCompleteWarningDialogProp = Pick<DialogProps, 'open' | 'onOpenChange'> & {
    noCompleteCount: number,
    onConfirm?: Function
}

function NoCompleteWarningDialog({ open, onOpenChange, onConfirm, noCompleteCount }: NoCompleteWarningDialogProp) {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogSurface>
                <DialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger action='close'>
                                <Button
                                    appearance='subtle'
                                    icon={<Dismiss24Regular />}
                                />
                            </DialogTrigger>
                        }
                    >
                        No complete download
                    </DialogTitle>
                    <DialogContent>
                        <Text size={400}>
                            You have {noCompleteCount === 1 ? 'a download' : `${noCompleteCount} downloads`} no complete.
                            If you exit all will cancel
                        </Text>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance='primary'
                            onClick={() => onConfirm && onConfirm()}
                        >
                            Yes, I want exit
                        </Button>
                        <DialogTrigger action='close'>
                            <Button>No, keep dowload</Button>
                        </DialogTrigger>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}

export default NoCompleteWarningDialog