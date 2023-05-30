import { useLayoutEffect } from 'react'
import AppApi from '../appApi'
import useStore from './useStore'

function useLoadAppConfig() {
    const [, dispatch] = useStore()
    useLayoutEffect(() => {
        AppApi.loadConfig().then(config => {
            if (!config) { return }
            dispatch({ type: 'setting', payload: { config } })
        })
    }, [])
}

export default useLoadAppConfig