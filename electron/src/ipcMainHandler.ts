import { BrowserWindow, IpcMainInvokeEvent, NativeTheme, dialog, nativeTheme, shell } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import AppSetting, { AppConfig } from './appSetting'
import Db from './db'
import Downloader, { DownloadRequest } from './downloader'

export default class IpcMainHandler {

    static changeTheme(_event: IpcMainInvokeEvent, theme: NativeTheme['themeSource']) {
        nativeTheme.themeSource = theme
        AppSetting.updateConfig({ theme })
    }

    static loadConfig() {
        return AppSetting.getConfig()
    }

    static updateConfig(config: AppConfig, downloader: Downloader) {
        nativeTheme.themeSource = config.theme
        downloader.loadConfig(config)
        AppSetting.updateConfig(config)

        return AppSetting.getConfig()
    }

    static openPickFolderDialog(event: IpcMainInvokeEvent) {
        const window = BrowserWindow.fromWebContents(event.sender)

        if (!window) { return [] }

        const folderPaths = dialog.showOpenDialogSync(window, {
            properties: ['openDirectory']
        })

        return folderPaths || []
    }

    static openFileInFolder(fileName: string, folderPath: string) {
        const filePath = path.join(folderPath, fileName)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            shell.showItemInFolder(filePath)
            return true
        } else {
            return false
        }
    }

    static async openFile(fileName: string, folderPath: string) {
        const filePath = path.join(folderPath, fileName)
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const errorMessage = await shell.openPath(filePath)
            return errorMessage
        } else {
            return 'File not found'
        }
    }

    static checkExistsFile(fileName: string, folderPath: string) {
        const filePath = path.join(folderPath, fileName)
        return fs.existsSync(filePath)
    }

    static async getDownloadHistories() {
        const downloadHistories = await Db.getDownloadHitories()
        return downloadHistories
    }

    static addDownload(downloader: Downloader, requests: DownloadRequest[]) {
        return downloader.add(...requests)
    }

    static pauseDownload(downloader: Downloader, ...ids: string[]) {
        return downloader.pause(...ids)
    }

    static resumeDownload(downloader: Downloader, ...ids: string[]) {
        return downloader.resume(...ids)
    }

    static async cancelDownload(downloader: Downloader, ...ids: string[]) {
        const { saveDownloadHistory } = AppSetting.getConfig()
        const cancelledIds = downloader.cancel(...ids)

        if (saveDownloadHistory) {
            const cancelledDownloadItems = downloader.getDownloadItem(...cancelledIds)
            await Db.addDownloadHistory(...cancelledDownloadItems)
        }

        return cancelledIds
    }

    static async deleteDownload(downloader: Downloader, ...ids: string[]) {
        const deletedIdsInDownloader = downloader.delete(...ids)
        const deletedIdsInDb = await Db.deleteDownloadHistory(...ids)
        const deletedIdSet = new Set([...deletedIdsInDownloader, ...deletedIdsInDb])
        return Array.from(deletedIdSet)
    }

    static getDownloadedSize(downloader: Downloader, id: string) {
        return downloader.getDownloadedSize(id)
    }

    static getNoCompleteCount(dowloader: Downloader) {
        return dowloader.getNoCompleteCount()
    }
}