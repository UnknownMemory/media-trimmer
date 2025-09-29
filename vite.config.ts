import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: "/media-trimmer/",
  plugins: [react(), {
    name: "transform-sw-path",
    apply: "build",
    transformIndexHtml(html) {
      return html.replace("service-worker.ts", "service-worker.js")
    }
  }],
  build: {
    rollupOptions: {
      input: {
        index: "./index.html",
        'service-worker': './service-worker.js'
      },
      output: {
        entryFileNames: asset => asset.name == "service-worker" ? '[name].js' : 'assets/[name].js',
        assetFileNames: "assets/[name].[ext]"
      }
    }
  }
})
