import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'

import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  logLevel: 'silent',
  base: '/',
  server: {
    port: 3000,
  },

  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      // @ts-ignore
      // customViteReactPlugin: true,
      react: {
        babel: {
          plugins: [['babel-plugin-react-compiler', {}]],
        },
      },
      target: process.env.VITE_APP_BUILD_TARGET,
      pages: [],
    }),
  ],
})
