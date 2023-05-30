import { SelectTabData, SelectTabEvent, Tab, TabList } from '@fluentui/react-components'
import { useMemo } from 'react'

interface NavTabListProps {
    onTabSelect?: (tabValue: string) => void
}

function NavTabList({ onTabSelect: customHandleTabSelect }: NavTabListProps) {

    const handleSelect = useMemo(() => {
        return (_e: SelectTabEvent, data: SelectTabData) => {
            if (customHandleTabSelect) {
                customHandleTabSelect(data.value as string)
            }
        }
    }, [])
    return (
        <TabList
            vertical
            size='large'
            defaultSelectedValue={'all'}
            onTabSelect={handleSelect}
        >
            <Tab value={'all'}>All</Tab>
            <Tab value={'downloading'}>Downloading</Tab>
            <Tab value={'paused'}>Paused</Tab>
            <Tab value={'downloaded'}>Downloaded</Tab>
            <Tab value={'cancelled'}>Cancelled</Tab>
            <Tab value={'error'}>Error</Tab>
        </TabList>
    )
}

export default NavTabList