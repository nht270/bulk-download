import crypto from 'node:crypto'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import http, { IncomingMessage } from 'node:http'
import https from 'node:https'
import path from 'node:path'
import sanitize from 'sanitize-filename'
import UnitUtil from './unitUtil'
import Util from './util'

export interface DownloadRequest {
    link: string,
    saveFolder?: string
}


interface InternalDownloadItem {
    id: string,
    fileName: string,
    folderPath: string,
    link: string,
    status: DownloadStatus,
    fileSize: number
    stream?: fs.WriteStream,
    res?: IncomingMessage,
    controller?: AbortController,
    hasRequest: boolean
    created: Date,
    errorMessage?: string
}

export interface DownloadConfig {
    sameTimeDownloads?: number,
    overrideFile?: boolean,
    maxDuplicationFileName?: number,
    timeout?: number
}

export type DownloadItem = Omit<InternalDownloadItem, 'res' | 'controller' | 'stream' | 'hasRequest'> & {
    fileType: string
}

type DownloadStatesKey = keyof typeof DownloadStates
export type DownloadStatus = typeof DownloadStates[DownloadStatesKey]

type DownloaderEventNamesKey = keyof typeof DownloaderEventNames
export type DownloaderEventName = typeof DownloaderEventNames[DownloaderEventNamesKey]

export default interface Downloader extends EventEmitter {
    emit(eventName: DownloaderEventName, ...items: DownloadItem[]): boolean
    on(eventName: DownloaderEventName, listener: (...items: DownloadItem[]) => void): this
    once(eventName: DownloaderEventName, listener: (...items: DownloadItem[]) => void): this
}

export const DownloaderEventNames = {
    DOWNLOAD: 'download',
    ERROR: 'error',
    FINISH: 'finish'
} as const

export const DownloadStates = {
    DOWNLOADING: 'downloading',
    DOWNLOADED: 'downloaded',
    PENDING: 'pending',
    PAUSED: 'paused',
    CANCELLED: 'cancelled',
    ERROR: 'error'
} as const

export const SUPPORTED_PROTOCOL = ['http', 'https']
export const DEFAULT_SAME_TIME_DOWNLOADS = 5
export const DEFAULT_MAX_DUPLICATION_FILE_NAME = 1000
export const DEFAULT_TIMEOUT = 5 * UnitUtil.SECOND
export const MAX_TIMEOUT = 5 * UnitUtil.HOUSE
export const DEFAULT_FOLDER = path.join(__dirname, '..', 'download')
export const DEFAULT_ERROR_MESSAGE = 'unknown'

export default class Downloader extends EventEmitter {
    #innerDownloadItems: InternalDownloadItem[] = []
    #sameTimeDownloads: number = DEFAULT_SAME_TIME_DOWNLOADS
    #overrideFile: boolean = false
    #maxDuplicationFileName: number = DEFAULT_MAX_DUPLICATION_FILE_NAME
    #timeout: number = DEFAULT_TIMEOUT
    #downloadedSizes: Map<string, number> = new Map()

    constructor(requests: DownloadRequest[] = [], config: DownloadConfig = {}) {
        super()
        this.#innerDownloadItems = requests.map(this.#createInternalDownloadItem.bind(this))
        this.loadConfig(config)

        this.on(DownloaderEventNames.FINISH, () => {
            // start pending download item 
            this.start()
        })

        this.on(DownloaderEventNames.ERROR, () => {
            // start pending download item 
            this.start()
        })
    }

    #createInternalDownloadItem({ link, saveFolder }: DownloadRequest): InternalDownloadItem {
        const fileName = Util.extractFileNameFromUrl(link)
        let folderPath = saveFolder

        if (!folderPath || !fs.existsSync(folderPath)) {
            if (!fs.existsSync(DEFAULT_FOLDER)) {
                fs.mkdirSync(DEFAULT_FOLDER)
            }

            folderPath = DEFAULT_FOLDER
        }

        const id = crypto.randomUUID()
        return {
            id,
            fileName,
            folderPath,
            link,
            fileSize: 0,
            status: DownloadStates.PENDING,
            created: new Date(),
            hasRequest: false
        }
    }

    #getInnerDownloadItemByStatus(...states: DownloadStatus[]): InternalDownloadItem[] {
        const innerDownloadItems = this.#innerDownloadItems
            .filter(item => states.includes(item.status))

        return innerDownloadItems
    }

    #getInnerDownloadItemsById(ids: string[]) {
        const innerDownloadItems = this.#innerDownloadItems
            .filter(item => ids.includes(item.id))

        return innerDownloadItems
    }

    // if have start range will download at start range bytes to end (using for resume download)
    #download(item: InternalDownloadItem, startRange = 0): InternalDownloadItem {

        if (item.hasRequest) { return item }
        if (item.status === DownloadStates.DOWNLOADING) { return item }

        const controller = new AbortController()

        const requestOptions: https.RequestOptions = {
            timeout: this.#timeout,
            signal: controller.signal,
            headers: {
                // 'Content-Range': `bytes ${item.fileSize}-`,
                'Range': `bytes=${startRange}-`
            }
        }

        // assign outside get callback can abort when request timeout
        item.controller = controller

        const protocolOfLink = Util.getProtocol(item.link)

        if (!SUPPORTED_PROTOCOL.includes(protocolOfLink)) {
            return this.#markError(item, `The ${protocolOfLink} protocol have been unsupported`)
        }
        const clientModule = protocolOfLink === 'http' ? http : https

        const req = clientModule.get(item.link, requestOptions, (res) => {
            item.status = DownloadStates.DOWNLOADING
            this.#handleDownloadResponse.bind(this)(item, res)
            this.emit(DownloaderEventNames.DOWNLOAD, this.#extractDownloadItem(item))
        })

        item.hasRequest = true

        req.on('error', (err) => {
            this.#markError(item, err.message)
        })

        req.on('timeout', () => {
            this.#markError(item, 'Requset timeout')
        })

        return item
    }

    #handleDownloadResponse(downloadItem: InternalDownloadItem, response: IncomingMessage): InternalDownloadItem {

        // if isError = true, abort controller will call
        // if res in indownload item not reassign, the controllor will emit error
        downloadItem.res = response

        const isResError = response.statusCode && response.statusCode >= 400 && response.statusCode <= 599

        if (isResError) {
            return this.#markError(downloadItem, response.statusMessage)
        }

        if (downloadItem.stream) {
            response.pipe(downloadItem.stream)
        } else {
            let newFileName = Util.extractFileNameFromRes(response, downloadItem.fileName)
            // prioritize for file name in title search params
            newFileName = Util.extractFileNameFromTitleParam(downloadItem.link, newFileName)
            // remove illegal charaters by _ in filename
            newFileName = sanitize(newFileName, { replacement: '_' })

            const filePath = Util.createFilePathOnDisk(
                path.join(downloadItem.folderPath, newFileName),
                this.#overrideFile,
                this.#maxDuplicationFileName
            )

            const stream = fs.createWriteStream(filePath)
            response.pipe(stream)
            downloadItem.fileName = path.basename(filePath)
            downloadItem.stream = stream
        }

        // if downloaded a part before, will using file size
        // because content-length just length of receive content of request
        // when request start at a part of file we just receive size of rest part
        downloadItem.fileSize = downloadItem.fileSize || Number(response.headers['content-length'] || 0)

        response.on('error', (err) => {
            this.#markError(downloadItem, err.message)
        })

        response.on('timeout', () => {
            this.#markError(downloadItem, 'Response timeout')
        })

        response.on('data', (chunk: ArrayBuffer) => {
            let downloadedSize = this.#downloadedSizes.get(downloadItem.id) || 0
            downloadedSize += chunk.byteLength

            this.#downloadedSizes.set(downloadItem.id, downloadedSize)
        })

        response.on('end', () => {
            downloadItem.hasRequest = false
            downloadItem.status = DownloadStates.DOWNLOADED
            this.emit(DownloaderEventNames.FINISH, this.#extractDownloadItem(downloadItem))
        })

        return downloadItem
    }

    #markError(item: InternalDownloadItem, reason = DEFAULT_ERROR_MESSAGE): InternalDownloadItem {
        item.status = DownloadStates.ERROR
        item.errorMessage = reason
        this.#clearDownloadRequest(item, true)

        this.emit(DownloaderEventNames.ERROR, this.#extractDownloadItem(item))
        return item
    }

    #clearDownloadRequest(downloadItem: InternalDownloadItem, deleteFile = false) {
        const { res, stream, controller } = downloadItem

        downloadItem.hasRequest = false

        if (res) {
            res.unpipe()
            // destroy to res not throw error when abort by controller
            res.destroy()
        }

        if (stream) {
            stream.close()

            if (deleteFile && fs.existsSync(stream.path)) {
                fs.rmSync(stream.path)
            }
        }

        // if without response - request have been timeout so don't abort
        if (controller && res) {
            controller.abort()
        }

        this.#downloadedSizes.delete(downloadItem.id)
    }

    #extractDownloadItem(internalItem: InternalDownloadItem): DownloadItem {
        const { fileName, fileSize, folderPath, link, status, created, res, id, errorMessage } = internalItem
        const fileType = String(res ? (res.headers['content-type']?.split('/')[0] || '') : '')

        return {
            id,
            fileName,
            folderPath,
            link,
            status,
            created,
            fileSize,
            fileType,
            errorMessage
        }
    }

    #pauseOne(item: InternalDownloadItem): InternalDownloadItem {
        const isValidPauseStatus = ([
            DownloadStates.DOWNLOADING,
            DownloadStates.PENDING] as string[]
        ).includes(item.status)

        if (!isValidPauseStatus) { return item }

        item.status = DownloadStates.PAUSED
        item.hasRequest = false

        if (item.res) {
            item.res.unpipe()
            item.res.destroy()
        }

        if (item.controller) {
            item.controller.abort()
        }

        return item
    }

    #resumeOne(item: InternalDownloadItem): InternalDownloadItem {
        if (item.status !== DownloadStates.PAUSED) { return item }

        item.status = DownloadStates.PENDING
        return item
    }

    #cancelOne(item: InternalDownloadItem): InternalDownloadItem {

        const isValidCancel = ([
            DownloadStates.PENDING,
            DownloadStates.DOWNLOADING,
            DownloadStates.PAUSED
        ] as string[]).includes(item.status)

        if (!isValidCancel) { return item }

        this.#clearDownloadRequest(item, true)
        item.status = DownloadStates.CANCELLED
        this.#downloadedSizes.delete(item.id)

        return item
    }

    #getAllDownloadItemIds() {
        return this.#innerDownloadItems.map(({ id }) => id)
    }

    getConfig(): Required<DownloadConfig> {
        return {
            maxDuplicationFileName: this.#maxDuplicationFileName,
            overrideFile: this.#overrideFile,
            sameTimeDownloads: this.#sameTimeDownloads,
            timeout: this.#timeout
        }
    }

    normalizeConfig(config: DownloadConfig): Required<DownloadConfig> {
        const currentConfig = this.getConfig()
        const newValidConfig = this.extractValidConfigProperties(config)
        return {
            ...currentConfig,
            ...newValidConfig
        }
    }

    extractValidConfigProperties(raw: unknown): DownloadConfig {
        let partialConfig: DownloadConfig = {}

        if (raw === null || typeof raw !== 'object') {
            return partialConfig
        }

        const unsafeConfig = raw as DownloadConfig

        if (unsafeConfig.sameTimeDownloads &&
            Number.isSafeInteger(unsafeConfig.sameTimeDownloads) &&
            unsafeConfig.sameTimeDownloads > 0) {
            partialConfig = { ...partialConfig, sameTimeDownloads: unsafeConfig.sameTimeDownloads }
        }

        if (typeof unsafeConfig.overrideFile === 'boolean') {
            partialConfig = { ...partialConfig, overrideFile: unsafeConfig.overrideFile }
        }

        if (unsafeConfig.maxDuplicationFileName &&
            Number.isSafeInteger(unsafeConfig.maxDuplicationFileName) &&
            unsafeConfig.maxDuplicationFileName > 0) {
            partialConfig = { ...partialConfig, maxDuplicationFileName: unsafeConfig.maxDuplicationFileName }
        }

        if (unsafeConfig.timeout &&
            Number.isSafeInteger(unsafeConfig.timeout) &&
            unsafeConfig.timeout > 0) {
            partialConfig = { ...partialConfig, timeout: unsafeConfig.timeout }
        }

        return partialConfig
    }

    loadConfig(config: DownloadConfig): void {
        const normalizedConfig = this.normalizeConfig(config)
        this.#sameTimeDownloads = normalizedConfig.sameTimeDownloads
        this.#overrideFile = normalizedConfig.overrideFile
        this.#maxDuplicationFileName = normalizedConfig.maxDuplicationFileName
        this.#timeout = normalizedConfig.timeout
    }

    // load config and restart downloads if it have been pending
    hotLoadConfig(config: DownloadConfig): void {
        this.loadConfig(config)
        this.start()
    }

    add(...requests: DownloadRequest[]): DownloadItem[] {
        const downloadItems = requests.map(this.#createInternalDownloadItem)
        this.#innerDownloadItems.unshift(...downloadItems)

        // after add, if same time downloads > downloading items then start it
        this.start()
        return downloadItems.map(this.#extractDownloadItem)
    }

    // if ids is blank will delete all download item
    delete(...ids: string[]): string[] {
        const idsNeedDelete = ids.length > 0 ? ids : this.#getAllDownloadItemIds()

        const deletedIds: string[] = []
        let i = 0
        while (i < this.#innerDownloadItems.length) {
            const downloadItem = this.#innerDownloadItems[i]

            if (idsNeedDelete.includes(downloadItem.id)) {
                const wouldDelete = downloadItem.status !== DownloadStates.DOWNLOADED
                this.#clearDownloadRequest(downloadItem, wouldDelete)
                this.#innerDownloadItems.splice(i, 1)
                deletedIds.push(downloadItem.id)
            } else {
                i++
            }
        }

        // after delete, if rest download items is pending then start it
        this.start()

        return deletedIds
    }

    start(): void {
        let downloadingCount = this.#getInnerDownloadItemByStatus(DownloadStates.DOWNLOADING).length
        let i = 0
        while (downloadingCount < this.#sameTimeDownloads && i < this.#innerDownloadItems.length) {
            const downloadItem = this.#innerDownloadItems[i]
            i++
            if (downloadItem.status !== DownloadStates.PENDING) { continue }

            // using for resume download
            const downloadedSize = this.#downloadedSizes.get(downloadItem.id) || 0
            const itemNeedDownload = this.#download(downloadItem, downloadedSize)

            // because download can occur error eg: unsupperted protocol
            // so must check status
            if (itemNeedDownload.status !== DownloadStates.ERROR) {
                downloadingCount++
            }
        }

    }

    pause(...ids: string[]): string[] {
        const idsNeedPause = ids.length > 0 ? ids : this.#getAllDownloadItemIds()

        const pausedIds: string[] = []
        const neededItems = this.#getInnerDownloadItemsById(idsNeedPause)

        for (let item of neededItems) {
            const itemNeedPause = this.#pauseOne(item)

            if (itemNeedPause.status === DownloadStates.PAUSED) {
                pausedIds.push(itemNeedPause.id)
            }
        }

        // if paused items have status is downloading then start pending download items if any
        this.start()
        return pausedIds
    }

    resume(...ids: string[]): string[] {
        const idsNeedResume = ids.length > 0 ? ids : this.#getAllDownloadItemIds()
        const resumedIds: string[] = []
        const neededItems = this.#getInnerDownloadItemsById(idsNeedResume)

        for (let item of neededItems) {
            const itemNeedResume = this.#resumeOne(item)

            if (itemNeedResume.status === DownloadStates.PENDING ||
                itemNeedResume.status === DownloadStates.DOWNLOADING) {
                resumedIds.push(itemNeedResume.id)
            }
        }

        this.start()
        return resumedIds
    }

    cancel(...ids: string[]): string[] {
        const idsNeedCancel = ids.length > 0 ? ids : this.#getAllDownloadItemIds()
        const cancelledIds: string[] = []
        const neededItems = this.#getInnerDownloadItemsById(idsNeedCancel)

        for (let item of neededItems) {
            const itemNeedCancel = this.#cancelOne(item)

            // maybe cancel item, but item's status is error, it will not cancel
            if (itemNeedCancel.status === DownloadStates.CANCELLED) {
                cancelledIds.push(itemNeedCancel.id)
            }
        }

        this.start()
        return cancelledIds
    }

    getDownloadItem(...ids: string[]): DownloadItem[] {
        const downloadItems = this.#getInnerDownloadItemsById(ids)
        return downloadItems.map(this.#extractDownloadItem.bind(this))
    }

    getDownloadedSize(id: string): number {
        return this.#downloadedSizes.get(id) || 0
    }

    getNoCompleteCount(): number {
        return this.#getInnerDownloadItemByStatus(
            DownloadStates.DOWNLOADING,
            DownloadStates.PENDING,
            DownloadStates.PAUSED
        ).length
    }
}