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

function usePageComponent() {
  const url = useLocation()
  console.log(url)
  let query = useQuery(
    ['@!virtual-modules/pages', url.pathname],
    async () => {
      await delay(3000)
      let pageModule = await pages[url.pathname].data()
      return pageModule.default
    },
    { suspense: true, keepPreviousData: true }
  )
  return query.data.main.default
}

import { Routes, Route } from 'react-router'
export let delay = (t: number) => new Promise((res) => setTimeout(res, t))

export const App = () => {
  return (
    <Routes basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}>
      {Object.keys(pages)
        .filter((path) => path !== '/404')
        .map((path) => (
          <Route
            // avoid re-mount layout component
            // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
            path={path}
            element={<AppProvider />}
          />
        ))}
      <Route path="*" element={<div>Hello</div>} />
    </Routes>
  )
}
