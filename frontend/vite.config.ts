
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import fs from 'node:fs'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    https: {
      key: fs.readFileSync('./localhost.key'),
      cert: fs.readFileSync('./localhost.pem'),

    },
    proxy: {
      '/api': {
        target: 'https://localhost:7005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
