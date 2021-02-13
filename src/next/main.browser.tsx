import React, { Suspense } from 'react'
import {} from 'react-dom/experimental'
import { QueryClient, QueryClientProvider } from 'react-query'
import 'vite/dynamic-import-polyfill'
import ReactDOM from 'react-dom'
import pages from '@!virtual-modules/pages'
import {} from 'react-dom/experimental'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'
import { App } from './client'
import 'twind/shim'

if (!window.__NEXT_DATA__?.routePath) {
  throw new Error(`window.__NEXT_DATA__?.routePath should be defined`)
}

const routePath = window.__NEXT_DATA__.routePath

console.log(window.__NEXT_DATA__, pages)
pages[routePath].data().then(({ default: pageLoaded }: any) => {
  const queryClient = new QueryClient()
  queryClient.setQueryData(['@!virtual-modules/pages', routePath], pageLoaded)

  ReactDOM.unstable_createBlockingRoot(document.getElementById('root')!, {
    hydrate: true,
  }).render(
    <BrowserRouter timeoutMs={5000}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div>Loading</div>}>
          <ErrorBoundary
            fallbackRender={(props) => <div>{props.error.message}</div>}
          >
            <App />
          </ErrorBoundary>
        </Suspense>
      </QueryClientProvider>
    </BrowserRouter>
  )
})
