import { app, BrowserWindow, ipcMain, Menu, nativeImage, nativeTheme } from 'electron'
import path from 'node:path'
import AppSetting from './appSetting'
import Db from './db'
import Downloader, { DownloaderEventNames, DownloadItem, DownloadStates } from './downloader'
import IpcMainHandler from './ipcMainHandler'

const DEFAULT_WINDOW_HEIGHT = 480
const DEFAULT_WINDOW_WIDTH = 960
const MIN_WINDOW_WIDTH = 640
const MIN_WINDOW_HEIGHT = 360

const appIcon = nativeImage.createFromPath(path.join(__dirname, '..', 'img', 'sun_3d.png'))
const GUI_URL = 'http://localhost:5173'

function createWindow() {

    Db.init().then(() => {
        console.log('Database have init')
    })

    AppSetting.init()
    const appConfig = AppSetting.loadConfig()
    const downloader = new Downloader([], {
        timeout: appConfig.timeout,
        maxDuplicationFileName: appConfig.maxDuplicationFileName,
        overrideFile: appConfig.overrideFile,
        sameTimeDownloads: appConfig.sameTimeDownloads
    })

    const win = new BrowserWindow({
        height: DEFAULT_WINDOW_HEIGHT,
        width: DEFAULT_WINDOW_WIDTH,
        minWidth: MIN_WINDOW_WIDTH,
        minHeight: MIN_WINDOW_HEIGHT,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        autoHideMenuBar: true,
        icon: appIcon,
        titleBarStyle: 'hidden',
        titleBarOverlay: false
    })

    Menu.setApplicationMenu(null)

    nativeTheme.themeSource = appConfig.theme

    if (app.isPackaged) {
        win.loadFile(path.join(__dirname, '..', 'gui', 'index.html'))
    } else if (GUI_URL) {
        win.loadURL(GUI_URL)
    }

    // app handle
    ipcMain.handle('app:change-theme', IpcMainHandler.changeTheme)
    ipcMain.handle('app:load-config', IpcMainHandler.loadConfig)
    ipcMain.handle('app:update-config', (_e, config) => IpcMainHandler.updateConfig(config, downloader))
    ipcMain.handle('app:show-pick-folder-dialog', IpcMainHandler.openPickFolderDialog)
    ipcMain.handle('app:open-file-in-folder', (_e, fileName, folderPath) => IpcMainHandler.openFileInFolder(fileName, folderPath))
    ipcMain.handle('app:open-file', (_e, fileName, folderPath) => IpcMainHandler.openFile(fileName, folderPath))
    ipcMain.handle('app:check-exists-file', (_e, fileName, folderPath) => IpcMainHandler.checkExistsFile(fileName, folderPath))
    ipcMain.handle('app:minimise-window', () => win.minimize())
    ipcMain.handle('app:maximise-window', () => win.maximize())
    ipcMain.handle('app:restore-window', () => win.restore())
    ipcMain.handle('app:close-window', () => win.close())

    // handle for dev
    ipcMain.handle('dev:toggle-devtool', () => win.webContents.toggleDevTools())

    // dowloader handle
    ipcMain.handle('downloader:add-download', (_e, requests) => IpcMainHandler.addDownload(downloader, requests))
    ipcMain.handle('downloader:cancel-download', (_e, ...ids) => IpcMainHandler.cancelDownload(downloader, ...ids))
    ipcMain.handle('downloader:delete-download', (_e, ...ids) => IpcMainHandler.deleteDownload(downloader, ...ids))
    ipcMain.handle('downloader:pause-download', (_e, ...ids) => IpcMainHandler.pauseDownload(downloader, ...ids))
    ipcMain.handle('downloader:resume-download', (_e, ...ids) => IpcMainHandler.resumeDownload(downloader, ...ids))
    ipcMain.handle('downloader:get-download-histories', IpcMainHandler.getDownloadHistories)
    ipcMain.handle('downloader:get-downloaded-size', (_e, id) => IpcMainHandler.getDownloadedSize(downloader, id))
    ipcMain.handle('downloader:get-no-complete-count', () => IpcMainHandler.getNoCompleteCount(downloader))

    async function handleDownloadUpdate(...downloadItems: DownloadItem[]) {
        const { saveDownloadHistory } = AppSetting.getConfig()
        const isDownloadEvent = downloadItems[0].status === DownloadStates.DOWNLOADING
        if (saveDownloadHistory && !isDownloadEvent) {
            await Db.addDownloadHistory(...downloadItems)
        }
        win.webContents.send('update-download', ...downloadItems)

    }

    downloader.on(DownloaderEventNames.DOWNLOAD, handleDownloadUpdate)
    downloader.on(DownloaderEventNames.ERROR, handleDownloadUpdate)
    downloader.on(DownloaderEventNames.FINISH, handleDownloadUpdate)

    return win
}

const gotTheLock = app.requestSingleInstanceLock()

let mainWindow: BrowserWindow | null = null

if (gotTheLock) {
    app.on('second-instance', () => {
        if (!mainWindow) { return }
        if (mainWindow.isMinimized()) {
            mainWindow.restore()
        }

        mainWindow.focus()
    })

    app.whenReady().then(() => {
        mainWindow = createWindow()
    })

    app.on('before-quit', () => {
        AppSetting.saveConfig()
    })
} else {
    app.quit()
}
