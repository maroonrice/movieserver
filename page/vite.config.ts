import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import { resolve, basename } from 'path'
import Mock from './mock/mock.config'
import Components from 'unplugin-vue-components/vite'

const dotPathFixPlugin = () => ({
  name: 'dot-path-fix-plugin',
  configureServer: (server: any) => {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (Mock.isApi(req)) {
        Mock.response(req,res)
      } else {
        next()
      }
    })
  }
})

function getIndexHtml(path: string): string[] {
  const stat = fs.statSync(path)
  if (stat.isDirectory()) {
    const childs = fs.readdirSync(path)
    return childs.map(name => resolve(path, name)).map(getIndexHtml).flat()
  } else if (stat.isFile()) {
    return basename(path) == "index.html" ? [path] : []
  }
  return []
}
const pagedir = resolve(__dirname, 'src/page')
const indexfiles = getIndexHtml(pagedir)
function getPageName(path: string): string {
  return path.substring(pagedir.length, path.length - '/index.html'.length).replace(/[\\/]/g, '_')
}

const input = Object.fromEntries(new Map(indexfiles.map(path => [getPageName(path), path])))
console.log(input)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), dotPathFixPlugin(), Components({
    dirs: 'components'
  })],
  root: 'src',
  build: {
    rollupOptions: {input},
    outDir: '../dist',
    emptyOutDir: true,
  },
  base: '/'
})
