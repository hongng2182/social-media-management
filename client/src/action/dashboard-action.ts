/* eslint-disable import/prefer-default-export */

// Action
export const setUserManagedPages = (
    pages: any[],
): {
    type: 'SET_USER_MANAGED_PAGES'
    payload: {
        pages: any[]
    }
} => ({
    type: 'SET_USER_MANAGED_PAGES',
    payload: {
        pages,
    },
})


export type DashboardAction =
    | ReturnType<typeof setUserManagedPages>


