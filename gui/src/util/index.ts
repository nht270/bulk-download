/// <reference path="../global.d.ts" />

import { DownloadFilters } from '../components/AppContent'
import { DownloadItem, DownloadRequest } from '../downloadApi'

interface RelativeTimeOptions {
    type: 'long' | 'short',
    decimalPlaces: number
}

export const KB = 1024
export const MB = 1024 * KB
export const GB = 1024 * MB

export const MILLISECOND = 1
export const SECOND = 1000 * MILLISECOND
export const MINNUTE = 60 * SECOND
export const HOUR = 60 * MINNUTE
export const DAY = 24 * HOUR

export default class Util {

    static extractLinkFromJson(json: string) {
        try {
            const links: string[] = JSON.parse(json)
            if (!Array.isArray(links)) { return [] }

            return links
                .filter(link => typeof link === 'string')
                .filter(this.validURL)
        } catch (error) {
            return []
        }
    }

    static extractLinkFromText(text: string) {
        const links = text.split(/\s*[,;]?\n+\s*/)
        return links.filter(this.validURL)
    }

    static validURL(text: string) {
        try {
            new URL(text)
            return true
        } catch (e) {
            return false
        }
    }

    static createDownloadRequests(links: string[], folderPath?: string): DownloadRequest[] {
        return links.map(link => ({ link, saveFolder: folderPath }))
    }

    static try<TFunc extends unknown, TFallback extends (...args: unknown[]) => unknown>(tryFunc: TFunc, fallback = (() => { }) as TFallback) {
        const func: TFunc | typeof fallback = typeof tryFunc === 'function' ? tryFunc : fallback
        return ({ with: func })
    }

    static toDateText(date: Date) {
        return date.toLocaleString('vi-VN', { dateStyle: 'long' })
    }

    static toDateTimeText(date: Date) {
        return date.toLocaleString('vi-VN', { dateStyle: 'long', timeStyle: 'short' })
    }

    static transToRelativeDataSize(size: number, decimalPlaces = 2) {
        if (size < KB) {
            return `${size} B`
        }

        if (size < MB) {
            return `${this.round(size / KB, decimalPlaces)} KB`
        }

        if (size < GB) {
            return `${this.round(size / MB, decimalPlaces)} MB`
        }

        return `${this.round(size / GB, decimalPlaces)} GB`
    }

    static transToRelativeBandwidth(bandwidth: number, decimalPlaces = 2) {
        return `${this.transToRelativeDataSize(bandwidth, decimalPlaces)}/s`
    }

    static transToRelativeTime(ms: number, { type, decimalPlaces }: RelativeTimeOptions = { type: 'short', decimalPlaces: 2 }) {
        const TIMES_UNITS: Record<string, Record<typeof type, string>> = {
            MILLISECOND: { long: 'millisecond', short: 'ms' },
            SECOND: { long: 'second', short: 's' },
            MINNUTE: { long: 'minute', short: 'm' },
            HOUR: { long: 'hour', short: 'h' },
            DAY: { long: 'day', short: 'd' }
        }

        if (ms < SECOND) {
            return `${this.round(ms, decimalPlaces)} ${TIMES_UNITS.MILLISECOND[type]}`
        }

        if (ms < MINNUTE) {
            return `${this.round(ms / SECOND, decimalPlaces)} ${TIMES_UNITS.SECOND[type]}`
        }

        if (ms < HOUR) {
            return `${this.round(ms / MINNUTE, decimalPlaces)} ${TIMES_UNITS.MINNUTE[type]}`
        }

        if (ms < DAY) {
            return `${this.round(ms / HOUR, decimalPlaces)} ${TIMES_UNITS.HOUR[type]}`
        }

        return `${this.round(ms / DAY, decimalPlaces)} ${TIMES_UNITS.DAY[type]}`
    }

    static round(n: number, decimalPlaces = 2) {
        return Math.round(n * (10 ** decimalPlaces)) / (10 ** decimalPlaces)
    }

    static async copyToClipboard(content: string) {
        await window.navigator.clipboard.writeText(content)
    }

    // compare date by day
    // if st date > nd date return 1
    // if st date < nd date return 1
    // else return 0
    static compareDateByDay(stDate: Date, ndDate: Date) {
        const stYear = stDate.getFullYear()
        const stMonth = stDate.getMonth()
        const stDay = stDate.getDay()
        const ndYear = ndDate.getFullYear()
        const ndMonth = ndDate.getMonth()
        const ndDay = ndDate.getDay()

        for (let [st, nd] of [[stYear, ndYear], [stMonth, ndMonth], [stDay, ndDay]]) {
            if (st > nd) { return 1 }
            if (st < nd) { return -1 }
        }

        return 0
    }

    static createDownloadItemFilter(filter: DownloadFilters) {
        function checkDownloadItem(item: DownloadItem) {
            const isInvalidStatus =
                filter.states &&
                filter.states.length > 0 &&
                !filter.states.includes(item.status)

            if (isInvalidStatus) {
                return false
            }

            const isInvalidSearch =
                filter.search &&
                !item.fileName.toLocaleLowerCase().includes(filter.search.toLocaleLowerCase()) &&
                !item.link.toLocaleLowerCase().includes(filter.search.toLocaleLowerCase())

            if (isInvalidSearch) {
                return false
            }

            const isInvalidFileType =
                filter.fileTypes &&
                filter.fileTypes.length > 0 &&
                !filter.fileTypes.includes(item.fileType)

            if (isInvalidFileType) {
                return false
            }

            const isInvalidDate =
                (filter.fromDate && Util.compareDateByDay(filter.fromDate, item.created) === 1) ||
                (filter.toDate && Util.compareDateByDay(filter.toDate, item.created) === -1)

            if (isInvalidDate) {
                return false
            }

            const isInvalidSize =
                (typeof filter.fromSize === 'number' && item.fileSize < filter.fromSize) ||
                (typeof filter.toSize === 'number' && item.fileSize > filter.toSize)

            if (isInvalidSize) {
                return false
            }

            const isInvalidFolderPath =
                filter.folderPaths &&
                filter.folderPaths.length > 0 &&
                !filter.folderPaths.includes(item.folderPath)

            if (isInvalidFolderPath) {
                return false
            }

            return true
        }

        return checkDownloadItem
    }

    static capitalizeFirtLetter(text: string) {
        if (text.length === 0) { return text }
        return text[0].toUpperCase() + text.slice(1)
    }

    static checkFullWindow() {
        const isFullWindow =
            window.screenX === 0 &&
            window.screenY === 0 &&
            window.outerHeight === screen.height &&
            window.outerWidth === screen.width

        return isFullWindow
    }

    static getLastFragment(path: string, segment = '/') {
        const fragments = path.split(segment)
        return fragments[fragments.length - 1]
    }
}