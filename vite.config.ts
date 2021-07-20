import reactRefresh from "@vitejs/plugin-react-refresh";
import pages from "./src/vite-plugin";
import mdx from "vite-plugin-mdx";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRefresh(), mdx(), pages()],
});
