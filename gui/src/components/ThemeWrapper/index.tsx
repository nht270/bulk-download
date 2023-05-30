import { FluentProvider } from '@fluentui/react-components'
import useTheme from '../../hooks/useTheme'

interface ThemeWrapperProps {
    children: JSX.Element
}

function ThemeWrapper({ children }: ThemeWrapperProps) {
    const { theme } = useTheme()
    return (
        <FluentProvider theme={theme}>
            {children}
        </FluentProvider>
    )
}

export default ThemeWrapper