import React, { Suspense } from 'react'
import { } from 'react-dom/experimental'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import ssrPrepass from 'react-ssr-prepass'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import { getStyleTag, shim, virtualSheet } from 'twind/shim/server'
import { create } from 'twind'

import { App } from './client'

const sheet = virtualSheet()

const instance = create({
    sheet,
})


export async function renderToString(url: string) {
    try {
        sheet.reset()
        const queryClient = new QueryClient()
        let context = {}

        let element = (
            <Suspense fallback={<div>Loading</div>}>
                <HelmetProvider context={context}>
                    <QueryClientProvider client={queryClient}>
                        <StaticRouter location={url}>
                            <App />
                        </StaticRouter>
                    </QueryClientProvider>
                </HelmetProvider>
            </Suspense>
        )

        await ssrPrepass(element)

        const { helmet } = context as any
        const htmlAttrs = helmet.htmlAttributes.toString()
        const bodyAttrs = helmet.bodyAttributes.toString()

        let result = ReactDOM.renderToString(element)

        result = shim(result, instance.tw)

        return {
            body: result,
            head: `
     ${helmet.title.toString()}
     ${helmet.meta.toString()}
     ${helmet.link.toString()}
     ${helmet.noscript.toString()}
     ${helmet.script.toString()}
     ${getStyleTag(sheet)}
     ${helmet.style.toString()}`,
            htmlAttrs,
            bodyAttrs,
        }
    } catch (e) {
        console.log(e)
    }

    return ''
}

// ${chunkCtx.chunks.map(
//   ({ chunk }) =>
//     `<link rel="modulepreload" href="${publicUrl}${encodeURI(chunk)}" />`
// )}
// ${headTags.join('\n')}
