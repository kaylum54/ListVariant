# Tom Flips Chrome Extension

The Chrome extension handles cross-listing to marketplaces that lack public APIs. It uses Manifest V3 with per-platform content scripts that automate form filling through browser automation.

---

## Architecture

```
extension/
├── src/
│   ├── background/index.ts       Service worker: auth, image pre-fetch, tab orchestration
│   ├── content/
│   │   ├── facebook.ts           Facebook Marketplace form automation
│   │   ├── gumtree.ts            Gumtree post-ad form automation
│   │   ├── vinted.ts             Vinted new-item form automation
│   │   ├── depop.ts              Depop create-product form automation
│   │   ├── poshmark.ts           Poshmark create-listing form automation
│   │   └── auth-bridge.ts        Syncs JWT from web app to extension storage
│   ├── popup/
│   │   ├── index.html            Popup UI
│   │   └── popup.ts              Listing selector + cross-list triggers
│   ├── lib/
│   │   ├── api.ts                API client (fetch-based)
│   │   ├── storage.ts            chrome.storage.local wrapper
│   │   └── automation/
│   │       └── AutomationFramework.ts   Base class for all content scripts
│   ├── utils/
│   │   ├── delay.ts              Human-like delay utilities
│   │   └── dom.ts                waitForElement helper
│   └── manifest.json             MV3 manifest (copied to dist on build)
├── build.mjs                     Custom Vite build script
├── dist/                         Built output (load this in Chrome)
└── package.json
```

---

## How It Works

1. **Authentication**: The `auth-bridge.ts` content script runs on `localhost:3000`. When a user logs in on the web app, it picks up the JWT from `localStorage` and sends it to the background service worker via `chrome.runtime.sendMessage`. The background stores it in `chrome.storage.local`.

2. **Cross-listing flow**:
   - User opens the extension popup and selects a listing.
   - User clicks a marketplace button (e.g., "Facebook").
   - The popup sends a `CROSS_LIST` message to the background service worker.
   - The background worker fetches the full listing data from the API, including images.
   - Images are pre-fetched in the background as base64 data URLs (to bypass CORS restrictions that content scripts face on marketplace domains).
   - A new browser tab is opened to the marketplace's listing creation page.
   - Once the tab loads, the background sends a `CREATE_LISTING` message to the content script.
   - The content script (e.g., `facebook.ts`) extends `AutomationFramework` and fills in the form fields with human-like delays.

3. **Image handling**: Content scripts on `facebook.com` cannot fetch from `localhost:4000` due to CORS. The background service worker (which has unrestricted network access) pre-fetches each image, converts it to a data URL using `arrayBuffer()` + `btoa()`, and includes the data URLs in the message to the content script. The content script converts data URLs back to `File` objects for upload inputs.

---

## Supported Platforms

| Platform | Content Script | Create Page URL |
|----------|---------------|-----------------|
| Facebook Marketplace | `content/facebook.ts` | `https://www.facebook.com/marketplace/create/item` |
| Gumtree | `content/gumtree.ts` | `https://www.gumtree.com/post-ad` |
| Vinted | `content/vinted.ts` | `https://www.vinted.co.uk/items/new` |
| Depop | `content/depop.ts` | `https://www.depop.com/products/create` |
| Poshmark | `content/poshmark.ts` | `https://poshmark.co.uk/create-listing` |

eBay and Etsy are **not** handled by the extension -- they use server-side API integrations.

---

## Building the Extension

### One-time build

```bash
npm run build --workspace=@tom-flips/extension
```

Or from within the extension directory:

```bash
cd apps/extension
node build.mjs
```

### Watch mode (rebuilds on changes)

```bash
npm run dev
```

The Turborepo `dev` task runs `vite build --watch` for the extension, which rebuilds on file changes. Note: watch mode uses Vite's default config and may not match the production build exactly. For a full production build, use `node build.mjs`.

### What the build does

The custom `build.mjs` script runs two build passes:

1. **Background + popup** -- Built as ES modules with shared chunks.
2. **Content scripts** -- Each built separately as standalone IIFE bundles (Chrome content scripts cannot use ES module imports).

After both passes, it copies static assets:
- `src/manifest.json` -> `dist/manifest.json`
- `src/popup/index.html` -> `dist/popup.html`
- `public/icons/*.png` -> `dist/icons/`

---

## Loading in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (toggle in the top-right).
3. Click **Load unpacked**.
4. Select the `apps/extension/dist/` directory.
5. The "Tom Flips" extension should appear with its icon.

### After making changes

If you are using watch mode, Chrome does not auto-reload the extension. You need to:

1. Go to `chrome://extensions`.
2. Click the refresh icon on the Tom Flips extension card.
3. If content scripts changed, also reload any open marketplace tabs.

---

## Testing the Cross-List Flow

### Prerequisites

- The API must be running (`http://localhost:4000`).
- The web app must be running (`http://localhost:3000`).
- You must have at least one listing created in the web app.
- You must be logged into the target marketplace in your browser.

### Steps

1. Open `http://localhost:3000/login` and sign in.
   - The `auth-bridge` content script automatically syncs your JWT to the extension.
2. Click the Tom Flips extension icon in the Chrome toolbar.
3. The popup should show "Connected as ..." and list your listings.
4. Select a listing from the dropdown.
5. Click "Facebook" or "Gumtree" (or whichever platform button is available).
6. A new tab opens to the marketplace's create-listing page.
7. The content script fills in the form fields automatically.
8. **Review the filled form and publish manually** -- the extension does not click the final submit button.

### Troubleshooting

**"Not connected" in the popup**
- Make sure you are logged in at `http://localhost:3000`.
- Reload the extension on `chrome://extensions`.
- Check the service worker console (click "Inspect views: service worker" on the extension card) for errors.

**Content script not filling the form**
- Open the browser DevTools console on the marketplace tab.
- Look for `[TomFlips:<platform>]` log messages.
- The marketplace may have updated their DOM selectors. Check the content script's CSS selectors against the actual page.

**Images not uploading**
- Check the service worker console for image pre-fetch errors.
- Verify that the API is serving images at `/uploads/<filename>`.
- The background script logs each image fetch attempt.

---

## Permissions

The extension requests these permissions (defined in `manifest.json`):

| Permission | Why |
|-----------|-----|
| `storage` | Store the JWT auth token in `chrome.storage.local` |
| `activeTab` | Access the currently active tab for content script injection |
| `scripting` | Programmatically inject scripts if needed |
| `alarms` | Schedule periodic tasks (future use) |

### Host permissions

The extension needs access to these domains to inject content scripts:

- `https://www.facebook.com/*`
- `https://www.gumtree.com/*`
- `https://www.vinted.co.uk/*`
- `https://www.depop.com/*`
- `https://poshmark.co.uk/*` and `https://poshmark.com/*`
- `http://localhost:3000/*` (for auth bridge)
- `http://localhost:4000/*` (for API access from background)
