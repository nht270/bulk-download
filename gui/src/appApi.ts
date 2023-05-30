import { AppConfig } from './global'
import Util from './util'

export default class AppApi {
    static async changeTheme(theme: 'system' | 'light' | 'dark') {
        await Util.try(window?.app?.changeTheme).with(theme)
    }

    static async loadConfig() {
        const appSetting = await Util.try(
            window?.app?.loadConfig,
            async () => null
        ).with()

        return appSetting
    }

    static async updateConfig(config: AppConfig) {
        const appConfig = await Util.try(
            window?.app?.updateConfig,
            async () => null
        ).with(config)

        return appConfig
    }

    static async showPickFolderDialog() {
        const folderPaths = await Util.try(
            window?.app?.showPickFolderDialog,
            async () => []
        ).with()

        return folderPaths
    }

    static async openFileInFolder(fileName: string, folderPath: string) {
        const opened = await Util.try(
            window?.app?.openFileInFolder,
            async () => false
        ).with(fileName, folderPath)

        return opened
    }

    static async openFile(fileName: string, folderPath: string) {
        // if no error return blank text
        const errorMessage = await Util.try(
            window?.app?.openFile,
            async () => false
        ).with(fileName, folderPath)

        return errorMessage
    }

    static async checkExistFile(fileName: string, folderPath: string) {
        const isExists = await Util.try(
            window?.app?.checkExistsFile,
            async () => false
        ).with(fileName, folderPath)

        return isExists
    }

    static async minimiseWindow() {
        await Util.try(window?.app?.minimiseWindow).with()
    }

    static async maximiseWindow() {
        await Util.try(window?.app?.maximiseWindow).with()
    }

    static async restoreWindow() {
        await Util.try(window?.app?.restoreWindow).with()
    }

    static async closeWindow() {
        await Util.try(window?.app?.closeWindow).with()
    }
}