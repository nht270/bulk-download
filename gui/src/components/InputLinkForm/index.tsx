/// <reference path="../../global.d.ts" />

import { Button, Card, Field, Spinner, Switch, Text, Textarea, Tooltip, makeStyles, shorthands } from '@fluentui/react-components'
import { ArrowDownload24Regular } from '@fluentui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import AppApi from '../../appApi'
import useAddDownload from '../../hooks/useAddDownload'
import useStore from '../../hooks/useStore'
import Util from '../../util'

interface InputLinkFormValues {
    links: string[],
    folderPath: string
}

interface InputLinkFormProps {
    onSubmited?: () => void
}

const useStyles = makeStyles({
    text: {
        ...shorthands.overflow('hidden'),
        display: 'block',
        width: '70%'
    }
})

const InputLinkFormSchema = z.object({
    links: z.array(z.string()).min(1, 'Have must a link to download!'),
    folderPath: z.string().nonempty('Have must folder path to save files!')
})

function InputLinkForm({ onSubmited: cbHandleSubmit }: InputLinkFormProps) {
    const [globalState] = useStore()
    const form = useForm<InputLinkFormValues>({
        defaultValues: { links: [], folderPath: globalState.config.defaulSaveFolder },
        resolver: zodResolver(InputLinkFormSchema)
    })

    const { formState: { errors: formErrors } } = form

    const [isTypingInput, setIsTypingInput] = useState(false)
    const [isAddingDownload, setIsAddingDownload] = useState(false)
    const [linkFileName, setLinkFileName] = useState('')
    const [folderPath, setFolderPath] = useState(globalState.config.defaulSaveFolder)
    const [links, setLinks] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const truncateStyles = useStyles()
    const handleAddDownload = useAddDownload()

    const { hanlePickLinkFile, hanleChangeLinkTextarea, handlePickFolder, addDownloads } = useMemo(() => {

        async function hanlePickLinkFile(e: ChangeEvent) {
            if (!e.target) { return }
            const fileInput = e.target as HTMLInputElement

            if (!fileInput.files || fileInput.files.length <= 0) { return }
            const file = fileInput.files.item(0)

            if (!file || file.type !== 'application/json') { return }
            setLinkFileName(file.name)

            const json = await file.text()
            setLinks(Util.extractLinkFromJson(json))
        }

        function hanleChangeLinkTextarea(e: ChangeEvent) {
            if (!e.target) { return }
            const text = (e.target as HTMLInputElement).value
            setLinks(Util.extractLinkFromText(text))
        }

        async function handlePickFolder() {
            const [folderPath] = await AppApi.showPickFolderDialog()

            if (!folderPath) { return }
            form.setValue('folderPath', folderPath)
            setFolderPath(folderPath)
        }

        function addDownloads({ links, folderPath }: InputLinkFormValues) {
            const downloadRequests = Util.createDownloadRequests(links, folderPath)
            setIsAddingDownload(true)
            handleAddDownload(downloadRequests)
                .then(() => {
                    cbHandleSubmit && cbHandleSubmit()
                })
                .finally(() => {
                    setIsAddingDownload(false)
                })
        }

        return { hanlePickLinkFile, hanleChangeLinkTextarea, handlePickFolder, addDownloads }
    }, [])

    useEffect(() => {
        form.setValue('links', links, { shouldValidate: form.formState.isSubmitted })
    }, [links])

    useEffect(() => {
        if (globalState.config.defaulSaveFolder && form.getValues('folderPath') === '') {
            form.setValue('folderPath', globalState.config.defaulSaveFolder)
            setFolderPath(globalState.config.defaulSaveFolder)
        }
    }, [globalState.config])

    return (
        <form onSubmit={form.handleSubmit(addDownloads)}>
            <div className='vertical-flex'>
                <Switch
                    checked={isTypingInput}
                    label={'Typing link'}
                    onChange={(_e, data) => {
                        setIsTypingInput(data.checked)
                    }}
                />
                <input type="file" id='link-file' accept='.json' hidden onChange={hanlePickLinkFile} ref={fileInputRef} />
                <Field validationMessage={formErrors.links?.message}>
                    {
                        isTypingInput
                            ? <Textarea
                                placeholder='Typing your links'
                                appearance='filled-lighter-shadow'
                                onChange={hanleChangeLinkTextarea}
                            />
                            : (
                                <Card orientation='horizontal'>
                                    <Tooltip
                                        content={
                                            <div className='word-break'>
                                                <Text>
                                                    {linkFileName || `Let's pick a json file`}
                                                </Text>
                                            </div>
                                        }
                                        positioning={'above-start'}
                                        relationship='description'
                                    >
                                        <Text
                                            truncate wrap={false}
                                            className={truncateStyles.text}
                                        >
                                            {linkFileName || `Let's pick a json file`}
                                        </Text>
                                    </Tooltip>
                                    <Button
                                        appearance='transparent'
                                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    >
                                        Browse
                                    </Button>
                                </Card>
                            )
                    }
                </Field>
                <Field validationMessage={formErrors.folderPath?.message}>
                    <Card orientation='horizontal'>
                        <Tooltip
                            content={
                                <div className='break-work'>
                                    {folderPath || `Pick a folder to save`}
                                </div>
                            }
                            relationship='description'
                            positioning={'above-start'}
                        >
                            <Text
                                truncate
                                wrap={false}
                                className={truncateStyles.text}
                            >
                                {folderPath || `Pick a folder to save`}
                            </Text>
                        </Tooltip>
                        <Button
                            appearance='transparent'
                            onClick={handlePickFolder}
                        >
                            Browse
                        </Button>
                    </Card>
                </Field>
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <Button
                        icon={
                            isAddingDownload
                                ? <Spinner size='tiny' />
                                : <ArrowDownload24Regular />
                        }
                        appearance='subtle'
                        type='submit'
                    >
                        {isAddingDownload ? 'Adding' : 'Download'}
                        {links.length > 1 ? ` ${links.length} links` : ''}
                        {links.length === 1 ? ' a link' : ''}
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default InputLinkForm