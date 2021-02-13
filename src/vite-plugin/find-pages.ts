import { globFind } from '../utils'
import type { IFindPagesHelpers, IPageData } from './pages'

export async function defaultFindPages(
  pagesDirPath: string,
  findPagesHelpers: IFindPagesHelpers
): Promise<IPageData[]> {
  const pages = await globFind(pagesDirPath, '**/*$.{md,mdx,js,jsx,ts,tsx}')

  return Promise.all(
    pages.map(async ({ relative, absolute }) => {
      const pageURL = getPageURL(relative)
      return {
        pageId: pageURL,
        dataPath: absolute,
        staticData: await findPagesHelpers.extractStaticData(absolute),
      }
    })
  )
}

function getPageURL(relativePageFilePath: string) {
  let pageURL = relativePageFilePath.replace(/\$\.(md|mdx|js|jsx|ts|tsx)$/, '')
  pageURL = pageURL.replace(/index$/, '')
  // ensure starting slash
  pageURL = pageURL.replace(/\/$/, '')
  pageURL = `/${pageURL}`
  return pageURL
}
