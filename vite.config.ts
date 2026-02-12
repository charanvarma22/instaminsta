import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    root: process.cwd(),
    plugins: [react()],
    server: {
      port: 3001,
      strictPort: true,
      host: true,
    },
    preview: {
      port: 3005,
      strictPort: true,
      host: true,
      allowedHosts: ['instaminsta.com'],
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    }
  };
});
