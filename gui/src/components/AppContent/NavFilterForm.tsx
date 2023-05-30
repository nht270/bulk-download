import { Button, Dropdown, DropdownProps, Field, Input, Label, Option, Select, Text } from '@fluentui/react-components'
import { DatePicker } from "@fluentui/react-datepicker-compat"
import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, useMemo, useRef } from 'react'
import { FieldErrors, useForm } from 'react-hook-form'
import z from 'zod'
import { DownloadFilters } from '.'
import useStore from '../../hooks/useStore'
import Util, { GB, KB, MB } from '../../util'

type NavFilterFormValues = Omit<DownloadFilters, 'search' | 'states'>

interface NavFilterFormProps {
    filters: NavFilterFormValues,
    onCancel?: (formValues: NavFilterFormValues) => void,
    onSubmit?: (formValues: NavFilterFormValues) => void
}

interface Range {
    sizeRange: string,
    dateRange: string
}

const navFilterFormSchema = z.object({
    fileTypes: z.array(z.string()),
    folderPaths: z.array(z.string()),
    fromSize: z
        .number({ invalid_type_error: 'Invalid size' })
        .min(0, 'Value of size must be greater or equal 0'),
    toSize: z
        .number({ invalid_type_error: 'Invalid size' })
        .min(0, 'Value of size must be greater or equal 0'),
    fromDate: z.date({ invalid_type_error: 'Invalid date' }),
    toDate: z.date({ invalid_type_error: 'Invalid date' })
}).partial().superRefine(({ fromSize, toSize, fromDate, toDate }, ctx) => {
    if (typeof fromSize === 'number' && typeof toSize === 'number' && fromSize > toSize) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['sizeRange'],
            message: 'Size range invalid'
        })
    }

    if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dateRange'],
            message: 'Date range invalid'
        })
    }
})

function NavFilterForm({ filters, onCancel: customHandleCancel, onSubmit: customHandleSumit }: NavFilterFormProps) {
    const [globalState] = useStore()
    const refOfUnitValueOfFromSize = useRef(1)
    const refOfUnitValueOfToSize = useRef(1)
    const refOfValueOfFromSizeInput = useRef<number | undefined>(filters.fromSize)
    const refOfValueOfToSizeInput = useRef<number | undefined>(filters.toSize)

    const form = useForm<NavFilterFormValues>({
        defaultValues: filters,
        resolver: zodResolver(navFilterFormSchema)
    })

    const formErrors = form.formState.errors as FieldErrors<NavFilterFormValues & Range>
    const shouldValidate = form.formState.isSubmitted

    const [fileTypes, folderPaths] = useMemo(() => {
        const fileTypeSet = new Set<string>()
        const folderPathSet = new Set<string>()
        for (let downloadItem of globalState.downloadItems) {

            if (downloadItem.fileType) {
                fileTypeSet.add(downloadItem.fileType)
            }

            if (downloadItem.folderPath) {
                folderPathSet.add(downloadItem.folderPath)
            }

        }

        return [
            [...fileTypeSet.values()],
            [...folderPathSet.values()]
        ]
    }, [globalState.downloadItems])

    const {
        setDateForOptionalField,
        handleChangeUnitOfFromSize,
        handleChangeUnitOfToSize,
        handleChangeFromSizeInput,
        handleChangeToSizeInput,
        handleSelectFileTypes,
        handleSelectFolderPaths
    } = useMemo(() => {
        // handler
        function setDateForOptionalField(value: string) {
            const date = new Date(value)

            if (value !== '' && !Number.isNaN(date.getTime())) {
                return date
            }
        }

        function handleChangeUnitOfFromSize(e: ChangeEvent) {
            if (!e.target) { return }
            const unitValue = Number((e.target as HTMLSelectElement).value)
            refOfUnitValueOfFromSize.current = unitValue

            const valueOfFromSizeInput = refOfValueOfFromSizeInput.current
            if (typeof valueOfFromSizeInput === 'number') {
                form.setValue('fromSize', valueOfFromSizeInput * unitValue)
            }
        }

        function handleChangeUnitOfToSize(e: ChangeEvent) {
            if (!e.target) { return }
            const unitValue = Number((e.target as HTMLSelectElement).value)
            refOfUnitValueOfToSize.current = unitValue

            const valueOfToSizeInput = refOfValueOfToSizeInput.current
            if (typeof valueOfToSizeInput === 'number') {
                form.setValue('toSize', valueOfToSizeInput * unitValue)
            }
        }

        function handleChangeFromSizeInput(e: ChangeEvent) {
            if (!e.target) { return }
            const size = (e.target as HTMLInputElement).valueAsNumber
            const unitValueOfFromSize = refOfUnitValueOfFromSize.current

            if (Number.isNaN(size)) {
                refOfValueOfFromSizeInput.current = undefined
                form.setValue('fromSize', undefined, { shouldValidate })
            } else {
                form.setValue('fromSize', size * unitValueOfFromSize, { shouldValidate })
                refOfValueOfFromSizeInput.current = size
            }
        }

        function handleChangeToSizeInput(e: ChangeEvent) {
            if (!e.target) { return }
            const size = (e.target as HTMLInputElement).valueAsNumber
            const unitValueOfToSize = refOfUnitValueOfToSize.current

            if (Number.isNaN(size)) {
                refOfValueOfToSizeInput.current = undefined
                form.setValue('toSize', undefined, { shouldValidate })
            } else {
                form.setValue('toSize', size * unitValueOfToSize, { shouldValidate })
                refOfValueOfToSizeInput.current = size
            }
        }

        const handleSelectFileTypes: DropdownProps['onOptionSelect'] = (_e, data) => {
            const fileTypes = data.selectedOptions
            form.setValue('fileTypes', fileTypes, { shouldValidate })
        }

        const handleSelectFolderPaths: DropdownProps['onOptionSelect'] = (_e, data) => {
            const folderPaths = data.selectedOptions
            form.setValue('folderPaths', folderPaths, { shouldValidate })
        }

        return {
            setDateForOptionalField,
            handleChangeUnitOfFromSize,
            handleChangeUnitOfToSize,
            handleChangeFromSizeInput,
            handleChangeToSizeInput,
            handleSelectFileTypes,
            handleSelectFolderPaths
        }
    }, [])

    return (
        <form
            className='nav-filter-form'
            onSubmit={form.handleSubmit(filters => {
                customHandleSumit && customHandleSumit(filters)
            })}
        >
            <div className='nav-filter-form__wrapper'>
                <div className="nav-filter-form__content">
                    <Field validationMessage={formErrors.fileTypes?.message}>
                        <div className="nav-filter-form__field">
                            <Label id='types-label'><Text weight='medium'>Types</Text></Label>
                            <Dropdown
                                aria-labelledby='types-label'
                                multiselect
                                placeholder='Select download file types'
                                appearance='filled-darker'
                                defaultSelectedOptions={filters.fileTypes}
                                defaultValue={(filters.fileTypes || []).map(Util.capitalizeFirtLetter).join(', ')}
                                onOptionSelect={handleSelectFileTypes}
                            >
                                {
                                    fileTypes.map(type => {
                                        return (
                                            <Option
                                                key={type}
                                                value={type}
                                            >
                                                {Util.capitalizeFirtLetter(type)}
                                            </Option>
                                        )
                                    })
                                }
                            </Dropdown>
                        </div>
                    </Field>
                    <Field validationMessage={formErrors.folderPaths?.message}>
                        <div className="nav-filter-form__field">
                            <Label id='folder-paths-label'><Text weight='medium'>Folders</Text></Label>
                            <Dropdown
                                aria-labelledby='folder-paths-label'
                                appearance='filled-darker'
                                multiselect
                                placeholder='Select folders'
                                defaultSelectedOptions={filters.folderPaths}
                                defaultValue={(filters.folderPaths || []).map((path) => Util.getLastFragment(path)).join(', ')}
                                onOptionSelect={handleSelectFolderPaths}
                            >
                                {
                                    folderPaths.map(path => {
                                        return (
                                            <Option
                                                key={path}
                                                value={path}
                                                text={Util.getLastFragment(path)}
                                            >
                                                <Text>{path}</Text>
                                            </Option>
                                        )
                                    })
                                }
                            </Dropdown>
                        </div>
                    </Field>
                    <Field validationMessage={formErrors.sizeRange?.message}>
                        <div className="nav-filter-form__field">
                            <Label><Text weight='medium'>Size</Text></Label>
                            <div className='combo-field'>
                                <Field validationMessage={formErrors.fromSize?.message}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '.2rem'
                                    }}>
                                        <Input
                                            appearance='filled-darker'
                                            type='number'
                                            onChange={handleChangeFromSizeInput}
                                            style={{ width: '8.5rem' }}
                                            defaultValue={String(filters.fromSize || '')}
                                        />
                                        <Select
                                            defaultValue={'1'}
                                            appearance='filled-darker'
                                            onChange={handleChangeUnitOfFromSize}
                                        >
                                            <option value='1'>B</option>
                                            <option value={String(KB)}>KB</option>
                                            <option value={String(MB)}>MB</option>
                                            <option value={String(GB)}>GB</option>
                                        </Select>
                                    </div>
                                </Field>
                                <div className="join-sign">-</div>
                                <Field validationMessage={formErrors.toSize?.message}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '.2rem'
                                    }}>
                                        <Input
                                            appearance='filled-darker'
                                            type='number'
                                            onChange={handleChangeToSizeInput}
                                            style={{ width: '8.5rem' }}
                                            defaultValue={String(filters.toSize || '')}
                                        />
                                        <Select
                                            defaultValue={'1'}
                                            appearance='filled-darker'
                                            onChange={handleChangeUnitOfToSize}
                                        >
                                            <option value='1'>B</option>
                                            <option value={String(KB)}>KB</option>
                                            <option value={String(MB)}>MB</option>
                                            <option value={String(GB)}>GB</option>
                                        </Select>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    </Field>
                    <Field validationMessage={formErrors.dateRange?.message}>
                        <div className="nav-filter-form__field">
                            <Label><Text weight='medium'>Created</Text></Label>
                            <div className='combo-field'>
                                <Field validationMessage={formErrors.fromDate?.message}>
                                    <DatePicker
                                        appearance='filled-darker'
                                        allowTextInput
                                        {...form.register('fromDate', { setValueAs: setDateForOptionalField })}
                                    />
                                </Field>
                                <div className="join-sign">-</div>
                                <Field validationMessage={formErrors.toDate?.message}>
                                    <DatePicker
                                        appearance='filled-darker'
                                        allowTextInput
                                        {...form.register('toDate', { setValueAs: setDateForOptionalField, })}
                                    />
                                </Field>
                            </div>
                        </div>
                    </Field>
                </div>
                <div className='nav-filter-form__footer'>
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
                        Ok
                    </Button>
                </div>
            </div>
        </form>
    )
}

export default NavFilterForm