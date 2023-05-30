import { nativeTheme, app } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

export interface AppConfig {
    theme: typeof nativeTheme['themeSource'],
    defaulSaveFolder: string,
    sameTimeDownloads: number
    overrideFile: boolean
    maxDuplicationFileName: number
    timeout: number,
    saveDownloadHistory: boolean
}

const APP_CONFIG_FILE_PATH = path.join(__dirname, '..', 'app.config.json')
const DEFAULT_THEME = 'system'
const DEFAULT_SAVE_FOLDER_NAME = 'Bulk Download Files'
const DEFAULT_SAVE_FOLDER_PATH =
    app.isPackaged
        ? path.join(app.getPath('downloads'), DEFAULT_SAVE_FOLDER_NAME)
        : path.join(__dirname, '..', 'download')

const DEFAULT_APP_CONFIG: AppConfig = {
    theme: DEFAULT_THEME,
    defaulSaveFolder: DEFAULT_SAVE_FOLDER_PATH,
    maxDuplicationFileName: 1000,
    overrideFile: false,
    sameTimeDownloads: 5,
    timeout: 5000,
    saveDownloadHistory: true
}

if (app.isPackaged && !fs.existsSync(DEFAULT_SAVE_FOLDER_PATH)) {
    fs.mkdirSync(DEFAULT_SAVE_FOLDER_PATH)
}

export default class AppSetting {

    static #config: Required<AppConfig> = DEFAULT_APP_CONFIG

    static init() {
        if (!fs.existsSync(APP_CONFIG_FILE_PATH)) {
            this.saveConfig(DEFAULT_APP_CONFIG)
        }
    }

    static loadConfig() {
        const appConfigJson = fs.readFileSync(APP_CONFIG_FILE_PATH, { encoding: 'utf-8' })
        let raw: unknown = null

        try {
            raw = JSON.parse(appConfigJson)
        } catch (error) {
            console.log(error)
        }

        const config = this.normalizeConfig(raw)
        this.#config = config

        return config
    }

    static saveConfig(config?: Partial<AppConfig>) {
        fs.writeFileSync(
            APP_CONFIG_FILE_PATH,
            JSON.stringify(config || this.#config, null, '\t'),
            { encoding: 'utf-8' }
        )
    }

    static getConfig() {
        return this.#config
    }

    static updateConfig(config: Partial<AppConfig>) {
        const validatedConfig = this.extractValidConfigProperties(config)
        const newConfig: Required<AppConfig> = {
            ...this.#config,
            ...validatedConfig
        }

        this.#config = newConfig
    }

    static normalizeConfig(raw: unknown): AppConfig {
        if (raw === null || typeof raw !== 'object') {
            return DEFAULT_APP_CONFIG
        }

        const partialConfig = this.extractValidConfigProperties(raw)

        return { ...DEFAULT_APP_CONFIG, ...partialConfig }
    }

    static extractValidConfigProperties(raw: unknown): Partial<AppConfig> {
        let partialConfig: Partial<AppConfig> = {}

        if (raw === null || typeof raw !== 'object') {
            return partialConfig
        }

        const unsafeConfig = raw as Partial<AppConfig>

        if (unsafeConfig.theme && ['system', 'light', 'dark'].includes(unsafeConfig.theme)) {
            partialConfig = { ...partialConfig, theme: unsafeConfig.theme }
        }

        if (unsafeConfig.defaulSaveFolder &&
            fs.existsSync(unsafeConfig.defaulSaveFolder) &&
            fs.statSync(unsafeConfig.defaulSaveFolder).isDirectory()) {
            partialConfig = { ...partialConfig, defaulSaveFolder: unsafeConfig.defaulSaveFolder }
        }

        if (unsafeConfig.maxDuplicationFileName &&
            Number.isSafeInteger(unsafeConfig.maxDuplicationFileName) &&
            unsafeConfig.maxDuplicationFileName > 0) {
            partialConfig = { ...partialConfig, maxDuplicationFileName: unsafeConfig.maxDuplicationFileName }
        }

        if (typeof unsafeConfig.overrideFile === 'boolean') {
            partialConfig = { ...partialConfig, overrideFile: unsafeConfig.overrideFile }
        }

        if (unsafeConfig.sameTimeDownloads &&
            Number.isSafeInteger(unsafeConfig.sameTimeDownloads) &&
            unsafeConfig.sameTimeDownloads > 0) {
            partialConfig = { ...partialConfig, sameTimeDownloads: unsafeConfig.sameTimeDownloads }
        }

        if (unsafeConfig.timeout &&
            Number.isSafeInteger(unsafeConfig.timeout) &&
            unsafeConfig.timeout > 0) {
            partialConfig = { ...partialConfig, timeout: unsafeConfig.timeout }
        }

        if (typeof unsafeConfig.saveDownloadHistory === 'boolean') {
            partialConfig = { ...partialConfig, saveDownloadHistory: unsafeConfig.saveDownloadHistory }
        }

        return partialConfig
    }
}