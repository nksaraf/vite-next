import React, { Suspense } from "react";
import { Routes, Route, matchRoutes } from "react-router";
import { useLocation } from "react-router";
import { useQuery } from "react-query";
import pages from "@!virtual-modules/pages";

export function CurrentPage() {
  const Component = useCurrentPage();

  if (!Component) {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading</div>}>
      <Component />
    </Suspense>
  );
}

function useCurrentPage() {
  const url = useLocation();
  let query = useQuery(
    ["@!virtual-modules/pages", url.pathname],
    async () => {
      try {
        let matchedRoutes = matchRoutes(
          pages.map((page) => ({
            element: <div></div>,
            caseSensitive: true,
            ...page,
          })),
          url
        );

        if (!matchedRoutes || matchRoutes.length === 0) {
          throw "Route not found";
        }

        console.log("matchedRoutes", matchedRoutes);
        let p = delay(1000);
        let pageModule = await matchedRoutes[0].route.component();
        await p;
        return pageModule;
      } catch (e) {
        console.error(e);
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
