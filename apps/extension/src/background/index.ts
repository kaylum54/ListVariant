import { Storage } from '../lib/storage';
import { API } from '../lib/api';

// Message handlers
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

const API_BASE = 'http://localhost:4000';

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
