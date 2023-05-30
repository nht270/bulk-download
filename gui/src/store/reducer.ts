/// <reference path="./../global.d.ts" />

import { DownloadItem } from '../downloadApi'
import { AppConfig, ThemeName } from '../global'

export interface GlobalState {
    config: AppConfig
    downloadItems: DownloadItem[],
    isPowerSave: boolean,
}

export interface IAction<Type extends string, TPayload extends Record<string, unknown>> {
    type: Type,
    payload: TPayload
}

export type ThemeAction = IAction<'theme', { theme: ThemeName }>
export type DownloadAction = IAction<'download', { downloadItems: DownloadItem[] }>
export type SettingAction = IAction<'setting', { config: AppConfig }>
export type PowerSaveAction = IAction<'powerSave', { isPowerSave: boolean }>
export type Action = ThemeAction | DownloadAction | SettingAction | PowerSaveAction

export function reducer(state: GlobalState, action: Action): GlobalState {
    const { type, payload } = action

    switch (type) {
        case 'theme':
            const newSetting = { ...state.config, theme: payload.theme }
            return { ...state, config: newSetting }
        case 'setting':
            return { ...state, config: payload.config }
        case 'download':
            return { ...state, downloadItems: payload.downloadItems }
        case 'powerSave':
            return { ...state, isPowerSave: payload.isPowerSave }
        default:
            return { ...state }
    }
}

const DEFAULT_APP_CONFIG: AppConfig = {
    theme: 'system',
    defaulSaveFolder: '',
    maxDuplicationFileName: 0,
    overrideFile: false,
    sameTimeDownloads: 0,
    timeout: 0,
    saveDownloadHistory: true
}

export const initGlobalState: GlobalState = {
    downloadItems: [],
    config: DEFAULT_APP_CONFIG,
    isPowerSave: false
}