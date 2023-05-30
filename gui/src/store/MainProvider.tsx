import { useReducer } from 'react'
import MainContext from './MainContext'
import { initGlobalState, reducer } from './reducer'

interface MainProviderProps {
    children: JSX.Element
}

function MainProvider({ children }: MainProviderProps) {
    const [globalState, dispatch] = useReducer(reducer, initGlobalState)

    return (
        <MainContext.Provider value={[globalState, dispatch]}>
            {children}
        </MainContext.Provider>
    )
}

export default MainProvider