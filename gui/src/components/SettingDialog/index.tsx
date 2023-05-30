import { Button, Dialog, DialogBody, DialogContent, DialogProps, DialogSurface, DialogTitle, DialogTrigger, Text } from '@fluentui/react-components'
import { Dismiss24Regular } from '@fluentui/react-icons'
import { AppConfig } from '../../global'
import SettingForm from '../SettingForm'

type SettingDialogProps = Pick<DialogProps, 'open' | 'onOpenChange'> & {
    onSubmitSettingForm?: (config: AppConfig) => void,
    onCancelSettingForm?: () => void
}

function SettingDialog({ open, onOpenChange, onSubmitSettingForm: handleSubmitSettingForm, onCancelSettingForm: handleCancelSettingForm }: SettingDialogProps) {
    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogSurface>
                <DialogBody>
                    <DialogTitle
                        action={
                            <DialogTrigger>
                                <Button
                                    appearance='subtle'
                                    icon={<Dismiss24Regular />}
                                />
                            </DialogTrigger>
                        }
                    >
                        <Text size={600}>Setting</Text>
                    </DialogTitle>
                    <DialogContent>
                        <SettingForm
                            onCancel={handleCancelSettingForm}
                            onSubmit={handleSubmitSettingForm}
                        />
                    </DialogContent>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    )
}

export default SettingDialog