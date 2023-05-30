/// <reference path="global.d.ts" />

import Util from './util'

export interface DownloadItem {
    id: string,
    fileName: string,
    folderPath: string,
    link: string,
    status: DownloadStatus,
    created: Date,
    fileSize: number,
    fileType: FileType,
    errorMessage?: string
}

export interface DownloadRequest {
    link: string
    saveFolder?: string
}

export type FileType = 'image' | 'text' | 'video' | 'application' | 'other'

type DownloadStatesKey = keyof typeof DownloadStates

export type DownloadStatus = typeof DownloadStates[DownloadStatesKey]

export const DownloadStates = {
    DOWNLOADING: 'downloading',
    DOWNLOADED: 'downloaded',
    PENDING: 'pending',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    ERROR: 'error'
} as const


export default class DownloadApi {
    static async onUpdateDownload(cb: (...downloadItems: DownloadItem[]) => void) {
        await Util.try(window?.downloader?.onUpdateDownload).with(cb)
    }

    static async addDownload(requests: DownloadRequest[]) {
        const downloadItems = await Util.try(
            window?.downloader?.addDownload,
            async () => ([])
        ).with(requests)

        return downloadItems
    }

    static async cancelDownload(...ids: string[]) {
        const canceledIds = await Util.try(
            window?.downloader?.cancelDownload,
            async () => ([]),
        ).with(...ids)

        return canceledIds
    }

    static async deleteDownload(...ids: string[]) {
        const deletedIds = await Util.try(
            window?.downloader?.deleteDownload,
            async () => ([]),
        ).with(...ids)

        return deletedIds
    }
    static async pauseDownload(...ids: string[]) {
        const pausedIds = await Util.try(
            window?.downloader?.pauseDownload,
            async () => ([]),
        ).with(...ids)

        return pausedIds
    }
    static async resumeDownload(...ids: string[]) {
        const resumedIds = await Util.try(
            window?.downloader?.resumeDownload,
            async () => ([]),
        ).with(...ids)

        return resumedIds
    }

    static async getDownloadHistories() {
        const downloadHistories = await Util.try(
            window?.downloader?.getDownloadHistories,
            async () => ([])
        ).with()

        return downloadHistories
    }

    static async getDownloadedSize(id: string) {
        const downloadedSize = await Util.try(
            window?.downloader?.getDownloadedSize,
            async () => 0
        ).with(id)

        return downloadedSize
    }

    static async getNoDownloadCount() {
        const noDownloadCount = await Util.try(
            window?.downloader?.getNoDownloadCount,
            async () => 0
        ).with()
        return noDownloadCount
    }
}