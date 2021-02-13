// @ts-check
import fs from 'fs'
import path from 'path'
import express from 'express'
import { ViteDevServer } from 'vite'

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
import config from '../../vite.config'

export async function createServer(
    any: any,
    isProd = process.env.NODE_ENV === 'production'
) {
    const resolve = (p: string) => path.resolve(__dirname, p)

    const indexProd = isProd
        ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
        : ''

    const app = express()
    // const viteConfig = await resolveConfig({}, 'serve')
    let vite: ViteDevServer | null = null
    if (!isProd) {
        vite = await require('vite').createServer({
            configFile: false,
            ...config,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: true,
            },
            ssr: {
                external: ['react', 'react-dom', 'react-dom/server'],
            },
        })
        // use vite's connect instance as middleware
        app.use(vite!.middlewares)
    } else {
        app.use(require('compression')())
        app.use(
            require('serve-static')(resolve('dist/client'), {
                index: false,
            })
        )
    }

    app.use('*', async (req, res) => {
        try {
            const url = req.originalUrl

            let template, render

            if (!isProd) {
                // always read fresh template in dev
                template = fs.readFileSync(
                    // @ts-ignore
                    path.join(config.root ?? './', 'index.html'),
                    'utf-8'
                )
                template = await vite!.transformIndexHtml(url, template)
                render = (await vite!.ssrLoadModule('./src/next/main.server'))
                    .renderToString
            } else {
                template = indexProd
                render = require(resolve('dist/server/server.ssr')).renderToString
            }

            const context: any = {}
            const { body: appHtml, head, htmlAttrs, bodyAttrs } = await render(
                url,
                context
            )

            if (context.url) {
                // Somewhere a `<Redirect>` was rendered
                return res.redirect(301, context.url)
            }
            const rootElementInjection = '<div id="root"></div>'
            if (!template.includes(rootElementInjection)) {
                throw new Error(
                    `Your index.html should contain the RootElementInjectPoint: "${rootElementInjection}" (it must appear exactly as-is)`
                )
            }
            const html = template
                .replace(
                    rootElementInjection,
                    // let client know the current ssr page
                    `<script>window.__NEXT_DATA__=${JSON.stringify({
                        routePath: url,
                    })};</script>
  <div id="root">${appHtml}</div>`
                )
                .replace('</head>', head + '</head>')
                .replace('<html', '<html ' + htmlAttrs)
                .replace('<body', '<body ' + bodyAttrs)

            res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
        } catch (e) {
            !isProd && vite!.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }
    })

    return {
        app: app as any,
        vite,
    }
}

if (!isTest) {
    createServer({}).then(({ app }) =>
        app.listen(3000, () => {
            console.log('http://localhost:3000')
        })
    )
}
