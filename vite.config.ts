import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteSitemapPlugin from "vite-plugin-sitemap"
// import { appRoutes } from "./src/routes"

// import {rou} from "react-router-dom"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),


    // viteSitemapPlugin({
    //   hostname: "https://meetnmart.com",
    //   readable: true,
    //   dynamicRoutes: appRoutes.map(it => it.path)
    // })

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
}));
