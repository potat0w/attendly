import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    cors: true,
    allowedHosts: [
      ".ngrok-free.app", // allow all ngrok subdomains
    ],
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    // Only use HMR with ngrok when explicitly enabled
    // Set VITE_USE_NGROK=true in .env when using ngrok
    ...(process.env.VITE_USE_NGROK === 'true' && {
      hmr: {
        overlay: false,
        clientPort: 443,
        protocol: 'wss'
      },
    }),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@api-hooks": path.resolve(__dirname, "./hooks"),
    },
  },
}));
