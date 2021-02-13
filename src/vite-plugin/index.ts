import * as path from 'path'
import type { Plugin } from 'vite'
import {
  IFindPagesHelpers,
  IFindPagesResult,
  renderPageListInSSR,
  collectPagesData,
  renderPageList,
  renderOnePageData,
} from './pages'
import { resolve } from '../utils'

export default function pluginFactory(
  opts: {
    pagesDir?: string
    findPages?: (helpers: IFindPagesHelpers) => Promise<void>
  } = {}
): Plugin {
  const { findPages } = opts
  let pagesDir: string = opts.pagesDir ?? ''
  let pagesData: Promise<IFindPagesResult>
  return {
    name: 'vite-react-next',
    config: () => ({
      define: {},
      alias: {
        // '@pages-infra/main.tsx': 'src/client/main.tsx',
        '/@pages-infra': './src',
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    }),
    configResolved: (config) => {
      if (!pagesDir) {
        pagesDir = path.resolve(config.root, 'app/pages')
      }
    },
    resolveId(importee, importer) {
      if (importee.includes('@!virtual-modules')) {
        return importee
      }
    },
    async load(id) {
      try {
        if (id.includes('@!virtual-modules/main')) {
          return `export * from ''`
        } else if (id.includes('@!virtual-modules/pages/')) {
          // one page data
          let pageId = id.replace(/[@\!a-zA-Z\/]*@\!virtual-modules\/pages/, '')
          if (pageId === '/__index') pageId = '/'
          if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
          const pagesDataAwaited = await pagesData
          console.log(pagesDataAwaited)
          const page = pagesDataAwaited?.[pageId]
          if (!page) {
            throw new Error(`Page not exist: ${pageId}`)
          }
          return renderOnePageData(page.data)
        } else if (id.includes('@!virtual-modules/pages')) {
          // page list
          if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
          console.log(await pagesData)
          return renderPageList(await pagesData)
        } else if (id.includes('@!virtual-modules/app')) {
          try {
            return `export { default } from "${await resolve(
              pagesDir,
              '_theme',
              ['.js', '.ts', '.tsx', '.jsx', '.md']
            )}";`
          } catch (e) {
            console.log(e)
          }
        } else if (id.includes('@!virtual-modules/ssr/data')) {
          if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
          return renderPageListInSSR(await pagesData)
        }
      } catch (e) {
        console.error(e)
        throw e
      }
    },
  }
}

export type { ITheme, IPagesStaticData, IPagesLoaded } from '../types'
