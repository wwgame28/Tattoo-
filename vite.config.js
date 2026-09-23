import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'frontend',base:process.env.SITE_BASE || '/Tattoo-/',publicDir:'public',plugins:[react()],build:{outDir:'../dist',emptyOutDir:true,assetsDir:'app-assets',rollupOptions:{output:{manualChunks:{react:['react','react-dom'],motion:['motion']}}}},server:{host:'0.0.0.0',allowedHosts:['terminal.local'],fs:{allow:['..']}}});
