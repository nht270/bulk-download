import { Button, Dialog, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Input, Tooltip } from '@fluentui/react-components'
import { Options24Regular, Dismiss24Regular, Search24Regular } from '@fluentui/react-icons'
import { useRef, useState } from 'react'
import useDebounce from '../../hooks/useDebounce'
import NavFilterForm from './NavFilterForm'
import { DownloadFilters } from '.'

interface NavSearchFormProps {
    filters: DownloadFilters,
    onSubmit?: (filters: DownloadFilters) => void,
    onChangeSearchText?: (text: string) => void
}

function NavSearchForm({ filters, onSubmit: customHandleSubmit, onChangeSearchText: customHandleChangeSearchText }: NavSearchFormProps) {
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [openNavFilterDialog, setOpenNavFilterDialog] = useState(false)

    const handleChangeSearchText = useDebounce((text: string) => {
        if (customHandleChangeSearchText) {
            customHandleChangeSearchText(text)
        }
    })

    return (
        <form
            className="nav__search-form"
            onSubmit={(e) => {
                e.preventDefault()
                if (searchInputRef.current && customHandleSubmit) {
                    const searchText = searchInputRef.current.value
                    customHandleSubmit({ ...filters, search: searchText })
                }
            }}>
            <Input
                contentAfter={<Search24Regular />}
                appearance='filled-lighter-shadow'
                placeholder='Search by file name'
                defaultValue={filters.search}
                onChange={(e) => {
                    if (!e.target) { return }
                    const searchText = (e.target as HTMLInputElement).value
                    handleChangeSearchText(searchText)
                }}
                ref={searchInputRef}
            />
            <Tooltip
                content={'Filter'}
                relationship='label'
            >
                <Button
                    icon={<Options24Regular />}
                    appearance='transparent'
                    onClick={() => setOpenNavFilterDialog(true)}
                />
            </Tooltip>
            <Dialog
                open={openNavFilterDialog}
                onOpenChange={(_e, { open }) => setOpenNavFilterDialog(open)}
            >
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle
                            action={
                                <DialogTrigger>
                                    <Button
                                        icon={<Dismiss24Regular />}
                                        appearance='subtle'
                                    />
                                </DialogTrigger>
                            }
                        >
                            Download filters
                        </DialogTitle>
                        <DialogContent>
                            <NavFilterForm
                                filters={filters}
                                onSubmit={(filters) => {
                                    if (customHandleSubmit) {
                                        customHandleSubmit(filters)
                                    }

                                    setOpenNavFilterDialog(false)
                                }}
                                onCancel={() => setOpenNavFilterDialog(false)}
                            />
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </form>
    )
}

export default NavSearchForm