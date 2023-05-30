import { createTableColumn } from '@fluentui/react-components'
import { DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow } from '@fluentui/react-data-grid-react-window'
import { useRef, useState } from 'react'
import { DownloadItem } from '../../downloadApi'
import useElementSize from '../../hooks/useElementSize'
import DownloadItemRow from '../DownloadItemRow'
import './index.scss'

interface DownloadListProps {
    downloadItems: DownloadItem[]
    showSelection: boolean,
    onSelectItems: (ids: string[]) => void
}

const column = createTableColumn<DownloadItem>({
    columnId: 'downloadItemRow'
})

function DownloadList({ downloadItems, showSelection, onSelectItems: handleSelectItems }: DownloadListProps) {
    const listContainerRef = useRef<HTMLDivElement>(null)
    const listContainerSize = useElementSize(listContainerRef)
    const [selectedItemCount, setSelectedItemCount] = useState(0)

    return (
        <div ref={listContainerRef} className='list-container'>
            <DataGrid
                items={downloadItems}
                columns={[column]}
                getRowId={(item: DownloadItem) => {
                    return item.id
                }}
                selectionMode={showSelection ? 'multiselect' : undefined}
                onSelectionChange={(_e, { selectedItems }) => {
                    const selectedIds = [...selectedItems.values()] as string[]
                    handleSelectItems(selectedIds)
                    setSelectedItemCount(selectedIds.length)
                }}
            >
                {
                    showSelection
                        ? (
                            <DataGridHeader>
                                <DataGridRow>
                                    {() => (
                                        <DataGridHeaderCell>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span>Select all</span>
                                                {selectedItemCount === 1 ? <span>An item is selected</span> : null}
                                                {selectedItemCount > 1 ? <span>{selectedItemCount} items is selected</span> : null}
                                            </div>
                                        </DataGridHeaderCell>
                                    )}
                                </DataGridRow>
                            </DataGridHeader>
                        ) : null
                }
                <DataGridBody<DownloadItem>
                    itemSize={70}
                    // if showSelection, data grid height subtract for height of header grid at above
                    height={listContainerSize.height - (showSelection ? 33 : 0)}
                >
                    {
                        ({ item, rowId }, style) => {
                            return (
                                <DataGridRow<DownloadItem>
                                    key={rowId}
                                    style={style}
                                >
                                    {() => <DataGridCell><DownloadItemRow {...item} /></DataGridCell>}
                                </DataGridRow>
                            )
                        }
                    }
                </DataGridBody>
            </DataGrid>
        </div>
    )
}

export default DownloadList