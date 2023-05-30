import fs from 'node:fs'
import { IncomingMessage } from 'node:http'
import path from 'node:path'
import { DEFAULT_MAX_DUPLICATION_FILE_NAME } from './downloader'

export const DEFAULT_FILE_NAME = 'untitled'

export default class Util {
    static createFilePathOnDisk(filePath: string, overrideFile = false, maxDuplicationFileName = DEFAULT_MAX_DUPLICATION_FILE_NAME) {
        let duplicationNameCount = 0
        let filePathOnDisk = filePath
        const fileExtension = path.extname(filePath)
        const replaceExtensionRegex = new RegExp(fileExtension + '$')

        while (fs.existsSync(filePathOnDisk) && !overrideFile && duplicationNameCount < maxDuplicationFileName) {
            const avoidDuplicationFileSubfix = ` (${++duplicationNameCount})`
            filePathOnDisk = fileExtension === ''
                ? filePath + avoidDuplicationFileSubfix
                : filePath.replace(replaceExtensionRegex, avoidDuplicationFileSubfix + fileExtension)
        }

        return filePathOnDisk
    }

    static extractFileNameFromRes(res: IncomingMessage, fallback = DEFAULT_FILE_NAME) {
        let fileName = fallback

        if (res.headers['content-disposition']) {
            const utf8FileNameRegex = /filename\*?=([^']*'')?([^;]*)/
            const fileNameRegex = /.*filename=\"(.+)\".*/

            let [, newFileName] = res.headers['content-disposition'].match(fileNameRegex) || []

            newFileName = res.headers['content-disposition'].match(utf8FileNameRegex)?.[2] || newFileName

            if (newFileName && newFileName.startsWith('"') && newFileName.endsWith('"')) {
                newFileName = newFileName.slice(1)
                newFileName = newFileName.slice(0, newFileName.length - 1)
            }

            fileName = newFileName || fileName
        }

        if (fileName !== fallback && res.headers['location']) {
            const newFileName = this.extractFileNameFromUrl(res.headers['location'], fileName)
            fileName = newFileName || fileName
        }

        return decodeURIComponent(fileName)
    }

    static extractFileNameFromUrl(url: string | URL, fallback = DEFAULT_FILE_NAME) {
        const urlObj = new URL(url)
        const slug = urlObj.pathname.split('/').filter(fragment => !!fragment).at(-1) as string
        return decodeURIComponent(slug || fallback)
    }

    static extractFileNameFromTitleParam(url: string | URL, fallback = DEFAULT_FILE_NAME) {
        const urlObj = new URL(url)
        const title = urlObj.searchParams.get('title')
        return decodeURIComponent(title || fallback)
    }

    static getProtocol(link: string) {
        try {
            const url = new URL(link)
            return url.protocol.replace(/:$/, '')
        } catch (error) {
            console.log(error)
            return ''
        }
    }
}