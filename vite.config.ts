import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { execSync } from 'child_process'

// 获取 Git 信息
function getGitVersion(): string {
  try {
    let tag = '';
    try {
      tag = execSync('git describe --tags --exact-match').toString().trim();
    } catch (e) {
      // 如果没有找到 tag，则忽略错误
    }

    if (tag) {
      return tag;
    }

    const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
    return `dev-${commitHash}`;
  } catch (e) {
    return 'unknown';
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // Added proxy configuration

  server: { 
    proxy: {
      '/backend-api': 'http://127.0.0.1:8080'
    }
  },
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@comfyorg/litegraph/dist/css/litegraph.css': path.resolve(__dirname, 'node_modules/@comfyorg/litegraph/dist/css/litegraph.css'),

    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: {
          'cryptojs': ['crypto-js']
        }
      }
      
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(getGitVersion())
  }
})
