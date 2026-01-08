import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // suppress a noisy Vite import-analysis warning about fully-dynamic imports
    // that originate from react-router internals (e.g. import(r.module)).
    // This plugin silences the message in dev and during build-time onwarn.
    {
      name: 'suppress-dynamic-import-warning',
      apply: 'serve',
      configureServer(server) {
        const origWarn = server.config.logger.warn.bind(server.config.logger);
        server.config.logger.warn = (msg: any, options?: any) => {
          try {
            if (typeof msg === 'string' && msg.includes('The above dynamic import cannot be analyzed by Vite.')) {
              return; // silence this specific warning
            }
          } catch (_) {}
          return origWarn(msg, options);
        }
      }
    }
  ],
  // also suppress during build by filtering rollup onwarn
  build: {
    rollupOptions: {
      onwarn(warning: any, warn: (w: any) => void) {
        try {
          if (warning && typeof warning.message === 'string' && warning.message.includes('The above dynamic import cannot be analyzed by Vite.')) {
            return; // ignore
          }
        } catch (_) {}
        warn(warning);
      }
    }
  }
})
