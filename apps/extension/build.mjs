import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Content scripts must be IIFE (no ES module imports allowed in Chrome content scripts)
// Background + popup can share chunks via ES modules
const contentScripts = [
  { name: 'content/facebook', entry: 'src/content/facebook.ts' },
  { name: 'content/gumtree', entry: 'src/content/gumtree.ts' },
  { name: 'content/vinted', entry: 'src/content/vinted.ts' },
  { name: 'content/depop', entry: 'src/content/depop.ts' },
  { name: 'content/poshmark', entry: 'src/content/poshmark.ts' },
  { name: 'content/auth-bridge', entry: 'src/content/auth-bridge.ts' },
];

const mainEntries = {
  background: resolve(__dirname, 'src/background/index.ts'),
  popup: resolve(__dirname, 'src/popup/popup.ts'),
};

// Build main entries (background + popup) as ES modules
console.log('Building background + popup...');
await build({
  configFile: false,
  build: {
    rollupOptions: {
      input: mainEntries,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    target: 'chrome110',
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});

// Build each content script as standalone IIFE
for (const script of contentScripts) {
  console.log(`Building ${script.name}...`);
  await build({
    configFile: false,
    build: {
      rollupOptions: {
        input: { [script.name]: resolve(__dirname, script.entry) },
        output: {
          format: 'iife',
          entryFileNames: '[name].js',
          inlineDynamicImports: true,
        },
      },
      outDir: 'dist',
      emptyOutDir: false, // Don't wipe previous builds
      minify: false,
      target: 'chrome110',
    },
    resolve: {
      alias: { '@': resolve(__dirname, 'src') },
    },
  });
}

// Copy static assets
console.log('Copying static assets...');
const dist = resolve(__dirname, 'dist');

copyFileSync(
  resolve(__dirname, 'src/manifest.json'),
  resolve(dist, 'manifest.json')
);

copyFileSync(
  resolve(__dirname, 'src/popup/index.html'),
  resolve(dist, 'popup.html')
);

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

console.log('Build complete!');
