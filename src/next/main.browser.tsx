import React, { Suspense } from "react";
import * as e from "react-dom/experimental";

import "twind/shim";
import "vite/dynamic-import-polyfill";
import { QueryClient, QueryClientProvider } from "react-query";
import ReactDOM from "react-dom";
import {
  BrowserRouter as BrowserReactRouter,
  matchRoutes,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { CurrentPage, PageRoutes } from "./router";

import pages from "@!virtual-modules/pages";
import { HelmetProvider } from "react-helmet-async";
import { Hydrate } from "react-query/hydration";
import config from "../../twind.config";
import { setup } from "twind/shim";

if (!window.__NEXT_DATA__?.routePath) {
  throw new Error(`window.__NEXT_DATA__?.routePath should be defined`);
}

setup({
  ...config,
} as any);

const routePath = window.__NEXT_DATA__.routePath;
const queryCache = window.__NEXT_DATA__.queryClient;

function BrowserRouter({ initialContext: { queryClient } }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={queryCache}>
        <BrowserReactRouter timeoutMs={5000}>
          <HelmetProvider>
            <Suspense fallback={<div>Loading</div>}>
              <ErrorBoundary
                fallbackRender={(props) => <div>{props.error.message}</div>}
              >
                <PageRoutes>
                  <CurrentPage />
                </PageRoutes>
              </ErrorBoundary>
            </Suspense>
          </HelmetProvider>
        </BrowserReactRouter>
      </Hydrate>
    </QueryClientProvider>
  );
}

let matchedRoutes = matchRoutes(
  pages.map((page) => ({
    element: <div></div>,
    caseSensitive: true,
    ...page,
  })),
  routePath
);

if (!matchedRoutes || matchRoutes.length === 0) {
  throw "Route not found";
}

console.log("matchedRoutes", matchedRoutes);

(matchedRoutes[0].route as any).component().then((pageLoaded: any) => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(["@!virtual-modules/pages", routePath], pageLoaded);

  ReactDOM.unstable_createBlockingRoot(document.getElementById("root")!, {
    hydrate: true,
  }).render(<BrowserRouter initialContext={{ queryClient }} />);
});
