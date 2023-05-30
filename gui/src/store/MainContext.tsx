import React from 'react'
import { Action, GlobalState } from './reducer'

const MainContext = React.createContext<[GlobalState, React.Dispatch<Action>] | null>(null)

export default MainContext