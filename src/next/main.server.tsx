import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/server'
import {} from 'react-dom/experimental'
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
    // export default function MyApp({ Component, pageProps }) {
    //   const queryClientRef = React.useRef()
    //   if (!queryClientRef.current) {
    //     queryClientRef.current = new QueryClient()
    //   }

    //   return (
    //     <QueryClientProvider client={queryClientRef.current}>
    //       <Hydrate state={pageProps.dehydratedState}>
    //         <Component {...pageProps} />
    //       </Hydrate>
    //     </QueryClientProvider>
    //   )
    // }
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

    // let output = `<!doctype html>
    // <html ${htmlAttrs}>
    // <head>
    // ${helmet.title.toString()}
    // ${helmet.meta.toString()}
    // <link rel="modulepreload" href="${publicUrl}static/build/bootstrap.js" />

    // ${helmet.link.toString()}
    // ${helmet.noscript.toString()}
    // ${helmet.script.toString()}
    // ${TwindServer.getStyleTag(customSheet)}
    // ${helmet.style.toString()}
    // </head>
    // <body ${bodyAttrs}>
    // <div id="root">${renderedMarkup}</div>
    // <script async type="module">
    // import { start } from "${publicUrl}static/build/bootstrap.js";
    // start(${JSON.stringify(bootstrapOptions)});
    // </script>
    // </body>
    // </html>`
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
