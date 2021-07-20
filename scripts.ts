import { kush } from "kush-cli";
import { ssrBuild } from "./src/next/prerender";
import { resolveConfig } from "vite";
import * as fs from "fs-extra";
import config from "./vite.config";

kush`
dev:
  $ echo vite dev
  await ${async () => {
    require("./src/next/server");
  }}
  
build-client:
  $ echo vite client build
  $ vite build --outDir ./dist/client

build-server:
  $ echo vite server build
  $ vite build --outDir ./dist/server --ssr src/render/server.ssr.tsx

build-static:
  $ echo vite static build
  await ${async () => {
    const viteConfig = await resolveConfig(getConfig() as any, "build");
    ssrBuild(viteConfig, {}, []).catch((err: any) => {
      console.error(err);
    });
  }}

build:
  $ build-client
  $ build-server

serve-static:
  $ serve dist/static

export:
  $ build-static

start:
  $ echo vite start
  await ${async () => {
    process.env.NODE_ENV = "production";
    require("./src/next/server");
  }}

ios-dev:
  await ${() => {
    let config = fs.readJson("capacitor.config.json");

    // @ts-ignore
    config.server = {
      // Server object contains port and url configurations
      server: {
        // You can make the app to load an external url (i.e. to live reload)
        url: "http://192.168.1.33:8100",
        // You can configure the local hostname, but it's recommended to keep localhost
        // as it allows to run web APIs that require a secure context such as
        // navigator.geolocation and MediaDevices.getUserMedia.
        // It is possible to configure the local scheme that is used. This can be useful
        // when migrating from cordova-plugin-ionic-webview, where the default scheme on iOS is ionic.
        // iosScheme: 'ionic',
        // androidScheme: 'http',
        // Normally all external URLs are opened in the browser. By setting this option, you tell
        // Capacitor to open URLs belonging to these hosts inside its WebView.
        // allowNavigation: ['example.org', '*.example.org', '192.0.2.1'],
      },
    };
  }}
  $ echo vite dev
  await ${async () => {
    require("./src/next/server");
  }}
`();

function getConfig() {
  return {
    configFile: false,
    ...config,
    // configFile: require('./vite.config.ts',
  };
}
