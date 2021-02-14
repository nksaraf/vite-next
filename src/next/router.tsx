import React, { Suspense } from "react";
import { Routes, Route } from "react-router";
import { useLocation } from "react-router";
import { useQuery } from "react-query";
import pages from "@!virtual-modules/pages";

export function Page({}: {}) {
  const Component = usePageComponent();
  // const Component = component || initialComponent;
  // const props = component.pageProps || pageProps;

  if (!Component) {
    return null;
  }

  // return <App Component={Component} pageProps={props} />;

  return (
    <Suspense fallback={<div>Loading</div>}>
      <Component />
    </Suspense>
  );
}

console.log(pages);

function usePageComponent() {
  console.log(pages);
  const url = useLocation();
  let query = useQuery(
    ["@!virtual-modules/pages", url.pathname],
    async () => {
      try {
        let pageModule = await pages
          .find((p: { path: string }) => p.path === url.pathname)
          .component();
        return pageModule;
      } catch (e) {
        console.log(e);
        throw e;
      }
    },
    { suspense: true, keepPreviousData: true }
  );
  return query?.data?.default;
}

export let delay = (t: number) => new Promise((res) => setTimeout(res, t));

export const PageRoutes = ({ children }: { children: React.ReactElement }) => {
  return (
    <Routes basename={import.meta.env.BASE_URL?.replace(/\/$/, "")}>
      {pages
        .filter((path: any) => path.path !== "/404")
        .map((path: any) => (
          <Route
            // avoid re-mount layout component
            // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
            key="same"
            path={path.path}
            element={children}
          />
        ))}
      <Route path="*" key="same" element={<div>No Route found</div>} />
    </Routes>
  );
};
