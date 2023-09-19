import React, {
    Dispatch,
    ReactNode,
    Reducer,
    createContext,
    useContext,
    useMemo,
    useReducer,
} from 'react'
import { DashboardAction } from '../action'

// State
type DashboardState = {
    userManagedPages: any[]
}

// Initial State
const DashboardInitialState: DashboardState = {
    userManagedPages: [],
}

// Reducer 
const DashboardReducer = (
    state: DashboardState,
    { payload, type }: DashboardAction,
) => {
    switch (type) {
        case 'SET_USER_MANAGED_PAGES': {
            const { pages } = payload

            return {
                ...state,
                userManagedPages: pages,
            }
        }

        default:
            throw new Error(`TYPE: ${type} not exist`)
    }
}
// Context
const DashboardContext = createContext<{
    state: DashboardState
    dispatch: Dispatch<DashboardAction>
}>({} as any)

// Provider
export function DashboardProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer<Reducer<DashboardState, DashboardAction>>(
        DashboardReducer,
        DashboardInitialState,
    )

    const memoizedState = useMemo(() => state, [state])
    console.log('memoizedState', memoizedState)

    return (
        <DashboardContext.Provider
            // eslint-disable-next-line react/jsx-no-constructed-context-values
            value={{ state: memoizedState, dispatch }}
        >
            {children}
        </DashboardContext.Provider>
    )
}

export const useDashboardState = () => {
    const context = useContext(DashboardContext)

    if (context === undefined) {
        throw new Error('useDashboardState was used outside of its Provider')
    }
    return context
}