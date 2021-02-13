import React, { Suspense } from 'react'

import { useLocation } from 'react-router'
import { useQuery } from 'react-query'
import pages from '@!virtual-modules/pages'

export function AppProvider() {
    const Component = usePageComponent()
    return (
        <Suspense fallback={<div>Loading</div>}>
            <Component />
        </Suspense>
    )
}

console.log(pages);


function usePageComponent() {
    const url = useLocation()
    let query = useQuery(
        ['@!virtual-modules/pages', url.pathname],
        async () => {
            console.log(pages.find(p => p.path === url.pathname))
            let pageModule = await pages.find(p => p.path === url.pathname).component()
            return pageModule
        },
        { suspense: true, keepPreviousData: true }
    )
    return query?.data?.default
}

import { Routes, Route } from 'react-router'
export let delay = (t: number) => new Promise((res) => setTimeout(res, t))

export const App = () => {
    return (
        <Routes basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}>
            {pages
                .filter((path) => path.path !== '/404')
                .map((path) => (
                    <Route
                        // avoid re-mount layout component
                        // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
                        key="same"
                        path={path.path}
                        element={<AppProvider />}
                    />
                ))}
            <Route path="*" key="same" element={<div>No Route found</div>} />
        </Routes>
    )
}
