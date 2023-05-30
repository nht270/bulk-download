import { Link, Text } from '@fluentui/react-components'
import { DownloadItem } from '../../downloadApi'
import AppApi from '../../appApi'
import { useLayoutEffect, MouseEvent, useMemo, useState } from 'react'

type DownloadOpenButtonsProps = Pick<DownloadItem, 'fileName' | 'folderPath'>

function DownloadOpenButtons({ fileName, folderPath }: DownloadOpenButtonsProps) {
    const [isExistsFile, setIsExistsFile] = useState(true)

    useLayoutEffect(() => {
        AppApi.checkExistFile(fileName, folderPath).then(isExistsFile => {
            setIsExistsFile(isExistsFile)
        })
    }, [])

    const { handleOpenInFolder, handleOpenFile } = useMemo(() => {
        async function handleOpenInFolder(e: MouseEvent) {
            e.preventDefault()
            const isOpen = await AppApi.openFileInFolder(fileName, folderPath)
            if (!isOpen) {
                setIsExistsFile(false)
            }
        }

        async function handleOpenFile(e: MouseEvent) {
            e.preventDefault()
            const errorMessage = await AppApi.openFile(fileName, folderPath)
            if (errorMessage) {
                setIsExistsFile(false)
            }
        }

        return { handleOpenInFolder, handleOpenFile }
    }, [])

    return (
        <div className="horizotal-flex">
            <Link
                onClick={handleOpenInFolder}
                disabled={!isExistsFile}
            >
                <Text size={200}>Open in folder</Text>
            </Link>
            <Link
                onClick={handleOpenFile}
                disabled={!isExistsFile}
            >
                <Text size={200}>Open file</Text>
            </Link>
        </div>
    )
}

export default DownloadOpenButtons