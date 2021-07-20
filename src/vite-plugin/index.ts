import globToRegexp from "glob-to-regexp";
/**
 * Plugin options.
 */
export interface Options {
  /**
   * Resolves to the `root` value from Vite config.
   * @default process.cwd()
   */
  root: string;
  /**
   * Relative path to the directory to search for page components.
   * @default 'src/pages'
   */
  pagesDir: string;
  /**
   * Valid file extensions for page components.
   * @default ['vue', 'js']
   */
  extensions: string[];
  /**
   * List of path globs to exclude when resolving pages.
   */
  exclude: string[];
  /**
   * Import routes directly or as async components
   * @default 'async'
   */
  importMode: ImportMode | ImportModeResolveFn;
  /**
   * Extend route records
   */
  extendRoute?: (route: Route, parent: Route | undefined) => Route | void;
}

export type ImportMode = "sync" | "async";
export type ImportModeResolveFn = (filepath: string) => ImportMode;

export type UserOptions = Partial<Omit<Options, "root">>;
import fg from "fast-glob";

export interface ResolverContext {
  /**
   * The path glob to search when resolving pages.
   */
  dir: string;
  /**
   * List of valid pages file extensions.
   */
  extensions: string[];
  /**
   * List of directories to exclude when resolving pages.
   */
  exclude: string[];
}

/**
 * Resolves the files that are valid pages for the given context.
 */
export async function resolve({
  dir,
  extensions,
  exclude,
}: ResolverContext): Promise<string[]> {
  return await fg(`${dir}/**/*.{${extensions.join(",")}}`, {
    ignore: ["node_modules", ".git", ...exclude],
    onlyFiles: true,
  });
}

export interface Route {
  name?: string;
  path: string;
  component: string;
  children?: Route[];
  meta?: Record<string, unknown>;
}

export interface BuildRoutesContext {
  files: string[];
  dir: string;
  extensions: string[];
  root: string;
  extendRoute?: Options["extendRoute"];
}

import path from "path";

/**
 * Generates a string containing code that exports
 * a `routes` array that is compatible with Vue Router.
 */
export async function generateRoutesCode(options: Options) {
  const { root, pagesDir, exclude, extensions, extendRoute } = options;
  const dir = normalizePath(path.join(root, pagesDir));
  const files = await resolve({ dir, extensions, exclude });

  const normalizedRoot = normalizePath(root);
  const routes = buildRoutes({
    files,
    dir,
    extensions,
    root: normalizedRoot,
    extendRoute,
  });

  return stringifyRoutes(routes, options);
}

/**
 * Normalizes a path to use forward slashes.
 */
function normalizePath(str: string): string {
  return str.replace(/\\/g, "/");
}

export function buildRoutes({
  files,
  dir,
  extensions,
  root,
  extendRoute,
}: BuildRoutesContext) {
  const routes: Route[] = [];

  for (const file of files) {
    const re = String(globToRegexp(dir, { extended: true })).slice(1, -2);
    const pathParts = file
      .replace(new RegExp(re), "")
      .replace(new RegExp(`\\.(${extensions.join("|")})$`), "")
      .split("/")
      .slice(1); // removing the pagesDir means that the path begins with a '/'

    const component = file.replace(root, "");
    const route: Route = {
      name: "",
      path: "",
      component: component.startsWith("/") ? component : `/${component}`,
    };

    let parent = routes;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      // Remove square brackets at the start and end.
      const isDynamicPart = isDynamicRoute(part);
      const normalizedPart = (isDynamicPart
        ? part.replace(/^\[(\.{3})?/, "").replace(/\]$/, "")
        : part
      ).toLowerCase();

      route.name += route.name ? `-${normalizedPart}` : normalizedPart;

      const child = parent.find(
        (parentRoute) => parentRoute.name === route.name
      );
      if (child) {
        child.children = child.children || [];
        parent = child.children;
        route.path = "";
      } else if (normalizedPart === "index" && !route.path) {
        route.path += "/";
      } else if (normalizedPart !== "index") {
        if (isDynamicPart) {
          // Catch-all route
          if (/^\[\.{3}/.test(part)) {
            route.path += `/*`;

            // route.path += '(.*)';
          } else if (i === pathParts.length - 1) {
            // route.path += '?';
            route.path += `/:${normalizedPart}`;
          }
        } else {
          route.path += `/${normalizedPart}`;
        }
      }
    }

    parent.push(route);
  }

  return prepareRoutes(routes, extendRoute);
}

const isDynamicRoute = (s: string) => /^\[.+\]$/.test(s);

/**
 * Performs a final cleanup on the routes array.
 * This is done to ease the process of finding parents of nested routes.
 */
function prepareRoutes(
  routes: Route[],
  extendRoute: Options["extendRoute"],
  parent?: Route
) {
  for (const route of routes) {
    if (route.name) {
      route.name = route.name.replace(/-index$/, "");
    }

    if (parent) {
      route.path = route.path.replace(/^\//, "").replace(/\?$/, "");
    }

    if (route.children) {
      delete route.name;
      route.children = prepareRoutes(route.children, extendRoute, route);
    }

    if (typeof extendRoute === "function") {
      Object.assign(route, extendRoute(route, parent) || {});
    }
  }
  return routes;
}

function resolveImportMode(
  filepath: string,
  mode: ImportMode | ImportModeResolveFn
) {
  if (typeof mode === "function") {
    return mode(filepath);
  }
  return mode;
}

function pathToName(filepath: string) {
  return filepath.replace(/[\_\.\-\\\/]/g, "_").replace(/[\[:\]()]/g, "$");
}

export function stringifyRoutes(routes: Route[], options: Options) {
  const imports: string[] = [];

  const routesCode = routes
    .map((route) => stringifyRoute(imports, route, options))
    .join(",\n");

  return `${imports.join(";\n")}
export default [${routesCode}];`.trim();
}

/**
 * Creates a stringified Vue Router route definition.
 */
function stringifyRoute(
  imports: string[],
  { name, path, component, children, meta }: Route,
  options: Options
): string {
  const props: string[] = [];

  if (name) {
    props.push(`name: '${name}'`);
  }

  props.push(`path: '${path}'`);
  props.push("props: true");

  const mode = resolveImportMode(component, options.importMode);
  if (mode === "sync") {
    const importName = pathToName(component);
    imports.push(`import ${importName} from '${component}'`);
    props.push(`component: ${importName}`);
  } else {
    props.push(`component: () => import('${component}')`);
  }

  if (children) {
    props.push(`children: [
      ${children.map((route: any) =>
        stringifyRoute(imports, route, options)
      )},\n
    ]`);
  }

  if (meta) {
    props.push(`meta: ${JSON.stringify(meta)}`);
  }

  return `{${props.join(",\n")}}`.trim();
}

import type { Plugin } from "vite";
import { resolveFile } from "../utils";

function createPlugin(userOptions: UserOptions = {}): Plugin {
  const options: Options = {
    root: process.cwd(),
    pagesDir: "pages",
    exclude: [],
    extensions: ["jsx", "js", "ts", "tsx", "md", "mdx"],
    importMode: "async",
    extendRoute: (route) => route,
    ...userOptions,
  };

  return {
    name: "vite-react-next",
    enforce: "pre",
    config: () => ({
      define: {},
      resolve: {
        alias: {
          "/@pages-infra": "./src",
        },
      },
    }),
    configResolved(config) {
      options.root = config.root;
    },
    resolveId(importee, importer) {
      if (importee.includes("@!virtual-modules")) {
        return importee;
      }
    },
    async load(id) {
      try {
        if (id.includes("@!virtual-modules/pages")) {
          console.log("resolving id");
          return generateRoutesCode(options);
        } else if (id.includes("@!virtual-modules/app")) {
          try {
            return `export { default } from "${await resolveFile(
              normalizePath(path.join(options.root, options.pagesDir)),
              "_theme",
              [".js", ".ts", ".tsx", ".jsx", ".md"]
            )}";`;
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
  };
}

export default createPlugin;
