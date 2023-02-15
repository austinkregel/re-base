import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      env: env,
      APP_ENV: {
        mode
      },
      APP_TYPE: {
        command
      },
    },
    plugins: [
      vue(),
    ]
  }
})
