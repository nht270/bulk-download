import React, { useContext } from 'react'
import MainContext from '../store/MainContext'
import { Action, GlobalState } from '../store/reducer'

function useStore() {
    const [globalState, dispatch] = useContext(MainContext) as [GlobalState, React.Dispatch<Action>]
    return [globalState, dispatch] as const
}

export default useStore