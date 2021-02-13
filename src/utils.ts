import globby from 'globby'
import * as path from 'path'

import * as fs from 'fs-extra'
import slash from 'slash'

export async function globFind(
    baseDir: string,
    glob: string
): Promise<{ relative: string; absolute: string }[]> {
    const pageFiles: string[] = await globby(glob, {
        cwd: baseDir,
        ignore: ['**/node_modules/**/*'],
        onlyFiles: true,
    })
    console.log(pageFiles)

    return pageFiles.map((relative) => {
        const absolute = path.join(baseDir, relative)
        return { relative, absolute }
    })
}

export async function resolveFile(
    pagesDirPath: string,
    name: string,
    extensions: string[]
) {
    for (let filename of extensions.map((ext: any) => name + ext)) {
        filename = path.join(pagesDirPath, filename)
        if (await fs.pathExists(filename)) {
            return slash(filename)
        }
    }
    throw new Error("can't find theme inside pagesDir: " + pagesDirPath)
}

export function invariant<T>(
    value: T,
    message: string
): asserts value is Exclude<T, null | undefined | false | '' | 0> {
    if (!value) {
        throw new Error(`Invariant violation: ${message}`)
    }
}

import Pino from 'pino'

export type { Logger } from 'pino'

export function createDefaultLogger(options: { level?: string } = {}) {
    return Pino({
        serializers: Pino.stdSerializers,
        level: options.level ?? 'info',
        name: 'Nostalgie',
        prettyPrint:
            process.env.NODE_ENV !== 'production'
                ? {
                    ignore: 'name,hostname,pid',
                    translateTime: 'HH:MM:ss.l',
                }
                : false,
        redact: ['req.headers'],
        timestamp: Pino.stdTimeFunctions.isoTime,
    })
}
