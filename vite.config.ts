import reactRefresh from '@vitejs/plugin-react-refresh'
import pages from './src/vite-plugin'
import mdx from 'vite-plugin-mdx'
import { defineConfig } from 'vite'
import * as path from 'path'

export default defineConfig({
  // jsx: 'react',
  alias: {
    '/@layout/': path.join(__dirname, 'layout'),
  },
  logLevel: 'info',
  plugins: [reactRefresh(), mdx(), pages()],
  optimizeDeps: {
    include: [],
  },
  // minify: false,
})
