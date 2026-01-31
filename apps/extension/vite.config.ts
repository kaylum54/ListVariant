import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Plugin to copy static assets (manifest, popup html, icons) to dist
function copyExtensionFiles() {
  return {
    name: 'copy-extension-files',
    closeBundle() {
      const dist = resolve(__dirname, 'dist');

      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'src/manifest.json'),
        resolve(dist, 'manifest.json')
      );

      // Copy popup.html
      copyFileSync(
        resolve(__dirname, 'src/popup/index.html'),
        resolve(dist, 'popup.html')
      );

      // Copy icons
      const iconsDist = resolve(dist, 'icons');
      if (!existsSync(iconsDist)) mkdirSync(iconsDist, { recursive: true });
      const iconsDir = resolve(__dirname, 'public/icons');
      if (existsSync(iconsDir)) {
        for (const size of ['icon16.png', 'icon48.png', 'icon128.png']) {
          const src = resolve(iconsDir, size);
          if (existsSync(src)) {
            copyFileSync(src, resolve(iconsDist, size));
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [copyExtensionFiles()],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/popup/popup.ts'),
        'content/facebook': resolve(__dirname, 'src/content/facebook.ts'),
        'content/gumtree': resolve(__dirname, 'src/content/gumtree.ts'),
        'content/auth-bridge': resolve(__dirname, 'src/content/auth-bridge.ts'),
      },
      output: {
        // IIFE format prevents ES module imports which content scripts can't use
        format: 'iife',
        entryFileNames: '[name].js',
        // No code splitting - each file must be self-contained for Chrome extensions
        inlineDynamicImports: false,
        assetFileNames: 'assets/[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    target: 'chrome110',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
