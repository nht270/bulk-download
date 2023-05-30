import { Button, Field, Input, Label, Select, Switch, Text } from '@fluentui/react-components'
import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { AppConfig } from '../../global'
import useStore from '../../hooks/useStore'
import Util from '../../util'
import './index.scss'

const settingFormSchema = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    defaulSaveFolder: z.string().min(1, `Default save folder can't blank`),
    sameTimeDownloads: z
        .number({ invalid_type_error: 'Download count invalid' })
        .int('Download count must be integer number')
        .positive('Download count must be greater than 0'),
    overrideFile: z.boolean(),
    maxDuplicationFileName: z
        .number({ invalid_type_error: 'Duplicate file name count invalid' })
        .int('Duplicate file name count must be integer number')
        .positive('Duplicate file name count must be greater than 0'),
    timeout: z
        .number({ invalid_type_error: 'Timeout invalid' })
        .int('Timeout must be integer number')
        .positive('Timeout must be greater 0'),
    saveDownloadHistory: z.boolean()
})

interface SettingFormProps {
    onSubmit?: (config: AppConfig) => void
    onCancel?: (config: AppConfig) => void
}

function SettingForm({ onSubmit: customHandleSumit, onCancel: customHandleCancel }: SettingFormProps) {
    const [globalState] = useStore()
    const defaulSaveFolderLabelRef = useRef<HTMLSpanElement>(null)

    const form = useForm<AppConfig>({
        defaultValues: globalState.config,
        resolver: zodResolver(settingFormSchema)
    })

    const { formState: { errors: formErrors } } = form
    return (
        <form
            className='setting-form'
            onSubmit={form.handleSubmit(config => {
                customHandleSumit && customHandleSumit(config)
            })}
        >
            <div className='setting-form__wrapper'>
                <div className="wrapper__content">
                    <Field
                        validationMessage={formErrors.theme?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Theme</Text></Label>
                            <Select {...form.register('theme')} appearance='filled-darker'>
                                <option value='system'>System</option>
                                <option value='light'>Light</option>
                                <option value='dark'>Dark</option>
                            </Select>
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.defaulSaveFolder?.message}
                    >
                        <div className="setting-form-field">
                            <Label>
                                <Text weight='medium'>Default save folder</Text>
                                <br />
                                <Text size={200} ref={defaulSaveFolderLabelRef}>
                                    {
                                        form.getValues('defaulSaveFolder') ||
                                        'Pick a folder to save download files'
                                    }
                                </Text>
                            </Label>
                            <Button
                                appearance='subtle'
                                onClick={() => {
                                    Util.try(
                                        window?.app?.showPickFolderDialog,
                                        async () => []
                                    ).with()
                                        .then(([folder]) => {
                                            if (!folder) { return }
                                            form.setValue('defaulSaveFolder', folder)
                                            if (!defaulSaveFolderLabelRef.current) { return }
                                            defaulSaveFolderLabelRef.current.innerText = folder
                                        })
                                }}
                            >
                                Browse
                            </Button>
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.sameTimeDownloads?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Max download items in a time</Text></Label>
                            <Input
                                type='number'
                                appearance='filled-darker'
                                {...form.register('sameTimeDownloads', { valueAsNumber: true })}
                            />
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.maxDuplicationFileName?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Max dupliaction file name allow</Text></Label>
                            <Input
                                type='number'
                                appearance='filled-darker'
                                {...form.register('maxDuplicationFileName', { valueAsNumber: true })}
                            />
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.overrideFile?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Override file if dupliaction file name</Text></Label>
                            <Switch
                                {...form.register('overrideFile')}
                            />
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.timeout?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Request timeout</Text></Label>
                            <Input
                                appearance='filled-darker'
                                {...form.register('timeout', { valueAsNumber: true })}
                            />
                        </div>
                    </Field>
                    <Field
                        validationMessage={formErrors.saveDownloadHistory?.message}
                    >
                        <div className="setting-form-field">
                            <Label><Text weight='medium'>Save download history</Text></Label>
                            <Switch
                                {...form.register('saveDownloadHistory')}
                            />
                        </div>
                    </Field>
                </div>
                <div className='wrapper__footer'>
                    <Button
                        appearance='subtle'
                        onClick={() => {
                            if (customHandleCancel) {
                                customHandleCancel(form.getValues())
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance='primary'
                        type='submit'
                    >
                        Save
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default memo(SettingForm)