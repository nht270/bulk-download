import { NativeTheme, contextBridge, ipcRenderer } from 'electron'
import { DownloadItem, DownloadRequest } from './downloader'

contextBridge.exposeInMainWorld('app', {
    'changeTheme': (theme: NativeTheme['themeSource']) => ipcRenderer.invoke('app:change-theme', theme),
    'loadConfig': () => ipcRenderer.invoke('app:load-config'),
    'updateConfig': (config: unknown) => ipcRenderer.invoke('app:update-config', config),
    'showPickFolderDialog': () => ipcRenderer.invoke('app:show-pick-folder-dialog'),
    'openFileInFolder': (fileName: string, folderPath: string) => ipcRenderer.invoke('app:open-file-in-folder', fileName, folderPath),
    'openFile': (fileName: string, folderPath: string) => ipcRenderer.invoke('app:open-file', fileName, folderPath),
    'minimiseWindow': () => ipcRenderer.invoke('app:minimise-window'),
    'maximiseWindow': () => ipcRenderer.invoke('app:maximise-window'),
    'restoreWindow': () => ipcRenderer.invoke('app:restore-window'),
    'closeWindow': () => ipcRenderer.invoke('app:close-window'),
    'checkExistsFile': (fileName: string, folderPath: string) => ipcRenderer.invoke('app:check-exists-file', fileName, folderPath)
})

contextBridge.exposeInMainWorld('downloader', {
    'addDownload': (downloadRequests: DownloadRequest[]) => ipcRenderer.invoke('downloader:add-download', downloadRequests),
    'pauseDownload': (...ids: string[]) => ipcRenderer.invoke('downloader:pause-download', ...ids),
    'resumeDownload': (...ids: string[]) => ipcRenderer.invoke('downloader:resume-download', ...ids),
    'cancelDownload': (...ids: string[]) => ipcRenderer.invoke('downloader:cancel-download', ...ids),
    'deleteDownload': (...ids: string[]) => ipcRenderer.invoke('downloader:delete-download', ...ids),
    'getDownloadHistories': () => ipcRenderer.invoke('downloader:get-download-histories'),
    'getDownloadedSize': (id: string) => ipcRenderer.invoke('downloader:get-downloaded-size', id),
    'getNoDownloadCount': () => ipcRenderer.invoke('downloader:get-no-complete-count'),
    'onUpdateDownload': (cb: Function) => {
        ipcRenderer.on(
            'update-download',
            (_e, downloadItem: DownloadItem) => cb(downloadItem)
        )
    }
})

contextBridge.exposeInMainWorld('dev', {
    'toggleDevTool': () => ipcRenderer.invoke('dev:toggle-devtool')
})