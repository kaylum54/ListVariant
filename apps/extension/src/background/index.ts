import { Storage } from '../lib/storage';
import { API } from '../lib/api';

const SELECTOR_CONFIG_STORAGE_KEY = 'tomflips_selector_config';
const SELECTOR_HEALTH_STORAGE_KEY = 'tomflips_selector_health';
const API_BASE = 'http://localhost:4000';

// ─── Selector Config Refresh ────────────────────────────────────────────────

async function refreshSelectorConfig(): Promise<void> {
  console.log('[TomFlips BG] Refreshing selector config from API...');
  try {
    // Check current cached version to avoid unnecessary downloads
    const cached = await new Promise<any>((resolve) => {
      chrome.storage.local.get([SELECTOR_CONFIG_STORAGE_KEY], (result) => {
        resolve(result[SELECTOR_CONFIG_STORAGE_KEY] || null);
      });
    });

    const vParam = cached?.version ? `?v=${encodeURIComponent(cached.version)}` : '';
    const response = await fetch(`${API_BASE}/api/config/selectors${vParam}`);

    if (response.status === 304) {
      console.log('[TomFlips BG] Selector config is up to date');
      return;
    }

    if (!response.ok) {
      console.warn(`[TomFlips BG] Selector config fetch failed: HTTP ${response.status}`);
      return;
    }

    const config = await response.json();
    if (config?.version && config?.platforms) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [SELECTOR_CONFIG_STORAGE_KEY]: config }, () => {
          console.log(`[TomFlips BG] Selector config cached: v${config.version}`);
          resolve();
        });
      });
    }
  } catch (err: any) {
    console.warn('[TomFlips BG] Selector config refresh failed:', err?.message || err);
  }
}

// ─── Health Check System ────────────────────────────────────────────────────

const PLATFORM_URLS: Record<string, string> = {
  vinted: 'https://www.vinted.co.uk/items/new',
  depop: 'https://www.depop.com/products/create',
  poshmark: 'https://poshmark.co.uk/create-listing',
  gumtree: 'https://www.gumtree.com/post-ad',
};

async function runHealthChecks(): Promise<void> {
  console.log('[TomFlips BG] Running selector health checks...');
  try {
    const cached = await new Promise<any>((resolve) => {
      chrome.storage.local.get([SELECTOR_CONFIG_STORAGE_KEY], (result) => {
        resolve(result[SELECTOR_CONFIG_STORAGE_KEY] || null);
      });
    });

    if (!cached?.platforms) {
      console.warn('[TomFlips BG] No selector config cached, skipping health check');
      return;
    }

    const results: Record<string, any> = {};

    for (const [platform, url] of Object.entries(PLATFORM_URLS)) {
      if (!cached.platforms[platform]) continue;

      try {
        // Open a background tab for the health check
        const tab = await chrome.tabs.create({ url: url as string, active: false });
        if (!tab.id) continue;

        const tabId = tab.id;

        // Wait for tab to load
        await new Promise<void>((resolve) => {
          const onUpdated = (updatedId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
            if (updatedId === tabId && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(onUpdated);
              resolve();
            }
          };
          chrome.tabs.onUpdated.addListener(onUpdated);
          // Timeout after 15s
          setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            resolve();
          }, 15000);
        });

        // Wait for page JS to render
        await new Promise((r) => setTimeout(r, 3000));

        // Build and inject probe script
        const selectorsJson = JSON.stringify(cached.platforms[platform].selectors);
        const probeScript = `
          (function() {
            const selectors = ${selectorsJson};
            const results = {};
            let totalKeys = 0;
            let foundKeys = 0;
            for (const [key, versions] of Object.entries(selectors)) {
              totalKeys++;
              let found = false;
              let matchedIndex = -1;
              let matchedVersion = null;
              for (let i = 0; i < versions.length; i++) {
                try {
                  const el = document.querySelector(versions[i].css);
                  if (el) { found = true; matchedIndex = i; matchedVersion = versions[i].version; break; }
                } catch (e) {}
              }
              if (found) foundKeys++;
              results[key] = { found, matchedIndex, matchedVersion };
            }
            const ratio = totalKeys > 0 ? foundKeys / totalKeys : 0;
            let overallStatus = 'broken';
            if (ratio > 0.8) overallStatus = 'healthy';
            else if (ratio >= 0.5) overallStatus = 'degraded';
            return { platform: '${platform}', timestamp: new Date().toISOString(), results, overallStatus };
          })();
        `;

        const execResults = await chrome.scripting.executeScript({
          target: { tabId },
          func: (script: string) => eval(script),
          args: [probeScript],
        });

        if (execResults?.[0]?.result) {
          results[platform] = execResults[0].result;
          console.log(`[TomFlips BG] Health check ${platform}: ${execResults[0].result.overallStatus}`);
        }

        // Close the tab
        await chrome.tabs.remove(tabId);
      } catch (err: any) {
        console.warn(`[TomFlips BG] Health check failed for ${platform}:`, err?.message || err);
        results[platform] = {
          platform,
          timestamp: new Date().toISOString(),
          results: {},
          overallStatus: 'broken',
        };
      }
    }

    // Store health check results
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [SELECTOR_HEALTH_STORAGE_KEY]: results }, () => {
        console.log('[TomFlips BG] Health check results stored');
        resolve();
      });
    });
  } catch (err: any) {
    console.warn('[TomFlips BG] Health checks failed:', err?.message || err);
  }
}

// ─── Alarms Setup ───────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Refresh selector config every 2 hours
  chrome.alarms.create('refreshSelectors', { periodInMinutes: 120 });
  // Run health checks every 6 hours
  chrome.alarms.create('healthCheck', { periodInMinutes: 360 });
  // Initial fetch on install
  refreshSelectorConfig();
});

// Also refresh on startup (service worker wake)
chrome.runtime.onStartup.addListener(() => {
  refreshSelectorConfig();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refreshSelectors') {
    refreshSelectorConfig();
  } else if (alarm.name === 'healthCheck') {
    runHealthChecks();
  }
});

// ─── Message handlers ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('[TomFlips BG] Unhandled error in message handler:', error);
      sendResponse({ error: error?.message || 'Internal extension error' });
    });
  return true;
});

async function handleMessage(
  message: any,
  sender: chrome.runtime.MessageSender
) {
  switch (message.type) {
    case 'GET_AUTH_STATUS':
      return getAuthStatus();
    case 'LOGIN':
      return login(message.token);
    case 'LOGOUT':
      return logout();
    case 'GET_PENDING_LISTINGS':
      return getPendingListings(message.marketplace);
    case 'REPORT_LISTING_STATUS':
      return reportListingStatus(
        message.listingId,
        message.marketplace,
        message.status
      );
    case 'START_LISTING_FLOW':
      return startListingFlow(
        message.listingId,
        message.marketplace,
        sender.tab?.id
      );
    case 'CROSS_LIST':
      return crossList(message.listing, message.marketplace);
    case 'GET_SELECTOR_CONFIG':
      return getSelectorConfig();
    case 'GET_SELECTOR_HEALTH':
      return getSelectorHealth();
    default:
      return { error: 'Unknown message type' };
  }
}

async function getAuthStatus() {
  const token = await Storage.get('authToken');
  if (!token) return { authenticated: false };

  try {
    const user = await API.getMe(token);
    return { authenticated: true, user };
  } catch {
    await Storage.remove('authToken');
    return { authenticated: false };
  }
}

async function login(token: string) {
  await Storage.set('authToken', token);
  return { success: true };
}

async function logout() {
  await Storage.remove('authToken');
  return { success: true };
}

async function getPendingListings(marketplace: string) {
  const token = await Storage.get('authToken');
  if (!token) return { error: 'Not authenticated' };
  return API.getPendingListings(token, marketplace);
}

async function reportListingStatus(
  listingId: string,
  marketplace: string,
  status: { success: boolean; externalId?: string; error?: string }
) {
  const token = await Storage.get('authToken');
  if (!token) return { error: 'Not authenticated' };
  return API.reportListingStatus(token, listingId, marketplace, status);
}

async function getSelectorConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get([SELECTOR_CONFIG_STORAGE_KEY], (result) => {
      resolve(result[SELECTOR_CONFIG_STORAGE_KEY] || null);
    });
  });
}

async function getSelectorHealth() {
  return new Promise((resolve) => {
    chrome.storage.local.get([SELECTOR_HEALTH_STORAGE_KEY], (result) => {
      resolve(result[SELECTOR_HEALTH_STORAGE_KEY] || null);
    });
  });
}

async function crossList(listing: any, marketplace: string) {
  console.log('[TomFlips BG] crossList called for', marketplace, 'listing:', listing.id);

  // Fetch the full listing from the API to get all fields + images
  const token = await Storage.get('authToken');
  if (token) {
    try {
      const fullListing = await API.getListing(token, listing.id);
      console.log('[TomFlips BG] Full listing fetched:', fullListing.title, 'images:', fullListing.images?.length);
      listing = { ...listing, ...fullListing };
    } catch (err) {
      console.warn('[TomFlips BG] Failed to fetch full listing, using popup data:', err);
    }
  } else {
    console.warn('[TomFlips BG] No auth token found');
  }

  // Pre-fetch images as data URLs in background (no CORS restrictions here)
  // Content scripts on facebook.com can't fetch from localhost
  if (listing.images?.length > 0) {
    console.log('[TomFlips BG] Pre-fetching', listing.images.length, 'images as data URLs...');
    const resolvedImages = [];
    for (const img of listing.images) {
      const imgUrl = img.url.startsWith('http') ? img.url : `${API_BASE}${img.url}`;
      try {
        const response = await fetch(imgUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        // Convert blob to data URL (FileReader not available in service workers)
        const arrayBuffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const dataUrl = `data:${blob.type || 'image/jpeg'};base64,${btoa(binary)}`;
        resolvedImages.push({ ...img, dataUrl, url: imgUrl });
        console.log('[TomFlips BG] Image fetched:', imgUrl.substring(imgUrl.lastIndexOf('/') + 1));
      } catch (err: any) {
        console.warn('[TomFlips BG] Failed to fetch image:', imgUrl, err.message);
      }
    }
    listing.images = resolvedImages;
    console.log('[TomFlips BG] Pre-fetched', resolvedImages.length, 'images');
  }

  const platformUrls: Record<string, string> = {
    facebook: 'https://www.facebook.com/marketplace/create/item',
    gumtree: 'https://www.gumtree.com/post-ad',
    vinted: 'https://www.vinted.co.uk/items/new',
    depop: 'https://www.depop.com/products/create',
    poshmark: 'https://poshmark.co.uk/create-listing',
  };

  // Etsy uses API — no browser tab needed
  if (marketplace === 'etsy') {
    console.log('[TomFlips BG] Etsy uses API integration, not browser automation');
    return { success: false, error: 'Etsy listings are created via the API, not browser automation' };
  }

  const url = platformUrls[marketplace];
  if (!url) {
    return { success: false, error: `Unknown marketplace: ${marketplace}` };
  }

  console.log('[TomFlips BG] Opening tab:', url);
  const tab = await chrome.tabs.create({ url });
  console.log('[TomFlips BG] Tab created with id:', tab.id);

  if (tab.id === undefined) {
    console.error('[TomFlips BG] Tab created but has no ID');
    return { success: false, error: 'Failed to create tab — no tab ID returned' };
  }

  const tabId = tab.id;
  const TAB_LOAD_TIMEOUT_MS = 30000; // 30 seconds max wait for tab to load

  // Wait for tab to finish loading, then send listing data
  return new Promise((resolve) => {
    let resolved = false;

    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        chrome.tabs.onUpdated.removeListener(listener);
        console.error('[TomFlips BG] Tab load timed out after', TAB_LOAD_TIMEOUT_MS, 'ms');
        resolve({ success: false, error: 'Tab failed to load within timeout' });
      }
    }, TAB_LOAD_TIMEOUT_MS);

    function listener(updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        if (resolved) return;
        chrome.tabs.onUpdated.removeListener(listener);
        clearTimeout(timeoutId);
        console.log('[TomFlips BG] Tab loaded, waiting 3s before sending message...');

        // Longer delay for heavy JS to render the form
        setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.log('[TomFlips BG] Sending CREATE_LISTING to tab', updatedTabId, 'data:', {
            title: listing.title,
            price: listing.price,
            imageCount: listing.images?.length,
          });
          chrome.tabs.sendMessage(updatedTabId, {
            type: 'CREATE_LISTING',
            listing,
            platform: marketplace,
          }).then(() => {
            console.log('[TomFlips BG] Message sent successfully');
          }).catch((err: any) => {
            console.error('[TomFlips BG] Failed to send message to tab:', err?.message || err);
          });
          resolve({ success: true });
        }, 3000);
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function startListingFlow(
  listingId: string,
  marketplace: string,
  tabId?: number
) {
  if (!tabId) return { error: 'No active tab' };

  const token = await Storage.get('authToken');
  if (!token) return { error: 'Not authenticated' };

  try {
    const listing = await API.getListing(token, listingId);

    await chrome.tabs.sendMessage(tabId, {
      type: 'CREATE_LISTING',
      listing,
      marketplace,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[TomFlips BG] startListingFlow failed:', err?.message || err);
    return { success: false, error: err?.message || 'Failed to start listing flow' };
  }
}
