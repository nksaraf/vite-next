import React, { Suspense } from "react";
import * as e from "react-dom/experimental";

import "twind/shim";
import "vite/dynamic-import-polyfill";
import { QueryClient, QueryClientProvider } from "react-query";
import ReactDOM from "react-dom";
import { BrowserRouter as BrowserReactRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Page, PageRoutes } from "./router";

import pages from "@!virtual-modules/pages";
import { HelmetProvider } from "react-helmet-async";

if (!window.__NEXT_DATA__?.routePath) {
  throw new Error(`window.__NEXT_DATA__?.routePath should be defined`);
}

const routePath = window.__NEXT_DATA__.routePath;

function BrowserRouter({ initialContext: { queryClient } }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserReactRouter timeoutMs={5000}>
        <HelmetProvider>
          <Suspense fallback={<div>Loading</div>}>
            <ErrorBoundary
              fallbackRender={(props) => <div>{props.error.message}</div>}
            >
              <PageRoutes>
                <Page />
              </PageRoutes>
            </ErrorBoundary>
          </Suspense>
        </HelmetProvider>
      </BrowserReactRouter>
    </QueryClientProvider>
  );
}

pages
  .find((p: { path: string }) => p.path === routePath)
  .component()
  .then((pageLoaded: any) => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      ["@!virtual-modules/pages", routePath],
      pageLoaded
    );

    ReactDOM.unstable_createBlockingRoot(document.getElementById("root")!, {
      hydrate: true,
    }).render(<BrowserRouter initialContext={{ queryClient }} />);
  });
