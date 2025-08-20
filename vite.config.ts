import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';
import sitemapPlugin from './vite-plugin-sitemap';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      // sitemapPlugin({
      //   baseUrl: env.VITE_BASE_URL || 'https://yourdomain.com',
      //   outDir: 'dist',
      //   staticRoutes: [
      //     {
      //       url: '/',
      //       changefreq: 'daily',
      //       priority: 1.0
      //     },
      //     {
      //       url: '/privacy-policy',
      //       changefreq: 'monthly',
      //       priority: 0.3
      //     },
      //     {
      //       url: '/terms-of-service',
      //       changefreq: 'monthly',
      //       priority: 0.3
      //     },
      //     {
      //       url: '/returns-policy',
      //       changefreq: 'monthly',
      //       priority: 0.3
      //     },
      //     {
      //       url: '/cookie-policy',
      //       changefreq: 'monthly',
      //       priority: 0.3
      //     }
      //   ]
      // })
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Server configuration
    server: {
      port: 3000,
      open: true,
      host: true,
      // https: {
      //   key: fs.readFileSync(path.resolve(__dirname, 'cert/key.pem')),
      //   cert: fs.readFileSync(path.resolve(__dirname, 'cert/cert.pem')),
      // },
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // Add base URL if needed
    base: '/',
  };
});