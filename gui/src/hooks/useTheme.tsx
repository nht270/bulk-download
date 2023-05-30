import { webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { useMemo } from 'react'
import AppApi from '../appApi'
import { ThemeName } from '../global'
import useStore from './useStore'

function getThemeFromName(themeName: ThemeName) {
    const staticThemeName = getStaticThemeName(themeName)

    switch (staticThemeName) {
        case 'light':
            return webLightTheme
        case 'dark':
            return webDarkTheme
        default:
            return webLightTheme
    }
}

// return light theme or dark theme, without system theme
function getStaticThemeName(themeName: ThemeName) {
    if (themeName !== 'system') {
        return themeName
    }

    return detectThemeOfSystem()
}

function detectThemeOfSystem() {
    const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    return isDarkTheme ? 'dark' : 'light'
}

function useTheme() {
    const [globalState, dispatch] = useStore()

    const changeTheme = useMemo(() => {
        return function (themeName: ThemeName) {
            AppApi.changeTheme(themeName)
            dispatch({ type: 'theme', payload: { theme: themeName } })
        }
    }, [])


    const [theme, staticThemeName, toggleTheme] = useMemo(() => {
        const theme = getThemeFromName(globalState.config.theme)
        const staticThemeName = getStaticThemeName(globalState.config.theme)

        function toggleTheme() {
            const REVERSE_THEMES = {
                'light': 'dark',
                'dark': 'light'
            } as const

            AppApi.changeTheme(REVERSE_THEMES[staticThemeName])
            dispatch({ type: 'theme', payload: { theme: REVERSE_THEMES[staticThemeName] } })
        }
        return [theme, staticThemeName, toggleTheme] as const
    }, [globalState.config.theme])

    return { theme, staticThemeName, changeTheme, toggleTheme }
}

export default useTheme