import { DownloadRequest, DownloadStatus, DownloadItem } from './downloadApi'
export type ThemeName = 'system' | 'light' | 'dark'

export interface AppConfig {
    theme: ThemeName
    defaulSaveFolder: string,
    sameTimeDownloads: number
    overrideFile: boolean
    maxDuplicationFileName: number
    timeout: number
    saveDownloadHistory: boolean
}

export interface ElectronAppApi {
    changeTheme: (theme: string) => Promise<void>
    loadConfig: () => Promise<AppConfig>
    updateConfig: (config: AppConfig) => Promise<AppConfig>
    showPickFolderDialog: () => Promise<string[]>
    openFileInFolder: (fileName: string, folderPath: string) => Promise<boolean>
    openFile: (fileName: string, folderPath: string) => Promise<string>
    checkExistsFile: (fileName: string, folderPath: string) => Promise<boolean>
    minimiseWindow: () => Promise<void>
    maximiseWindow: () => Promise<void>
    restoreWindow: () => Promise<void>
    closeWindow: () => Promise<void>
}

export interface ElectronDownloaderApi {
    getDownloadHistories: () => Promise<DownloadItem[]>
    getDownloadedSize: (id: string) => Promise<number>

    addDownload: (requests: DownloadRequest[]) => Promise<DownloadItem[]>
    cancelDownload: (...ids: string[]) => Promise<string[]>
    deleteDownload: (...ids: string[]) => Promise<string[]>
    pauseDownload: (...ids: string[]) => Promise<string[]>
    resumeDownload: (...ids: string[]) => Promise<string[]>
    onUpdateDownload: (cb: (...downloadItems: DownloadItem[]) => void) => Promise<void>
    getNoDownloadCount: () => Promise<number>
}

export interface ElectronDevApi {
    toggleDevTool: () => Promise<void>
}

export declare global {
    interface Window {
        app: ElectronAppApi,
        downloader: ElectronDownloaderApi
        dev: ElectronDevApi
    }
}