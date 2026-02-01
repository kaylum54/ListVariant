import { delay, randomDelay } from '../utils/delay';
import { waitForElement } from '../utils/dom';
import { SelectorRegistry } from '../lib/selectors/SelectorRegistry';
import { checkLoginStatus, showLoginError, showSuccessToast } from '../lib/loginDetection';

// Bundled fallback selectors — used if registry is not initialized
const SELECTORS = {
  titleInput: [
    'input[name="title"]',
    '[data-testid="title-input"]',
    'input[aria-label*="title" i]',
    'input[placeholder*="title" i]',
    '#title',
  ],
  priceInput: [
    'input[name="price"]',
    '[data-testid="price-input"]',
    'input[aria-label*="price" i]',
    'input[placeholder*="price" i]',
    '#price',
  ],
  descriptionInput: [
    'textarea[name="description"]',
    '[data-testid="description-input"]',
    'textarea[aria-label*="description" i]',
    'textarea[placeholder*="description" i]',
    '#description',
  ],
  postcodeInput: [
    'input[name="postcode"]',
    '[data-testid="postcode-input"]',
    'input[aria-label*="postcode" i]',
    'input[placeholder*="postcode" i]',
    '#postcode',
  ],
  categoryOption: [
    '[data-testid="category-option"]',
    '.category-item',
    '[role="option"]',
    '[role="menuitem"]',
  ],
  fileInput: [
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
    '[data-testid="image-upload"]',
  ],
};

let registry: SelectorRegistry | null = null;

/** Get selectors from registry if available, otherwise use bundled defaults */
function sel(key: keyof typeof SELECTORS): string[] {
  if (registry) {
    const fromRegistry = registry.getSelectors('gumtree', key);
    if (fromRegistry.length > 0) return fromRegistry;
  }
  return SELECTORS[key];
}

/**
 * Try each selector in a fallback array via waitForElement.
 * Returns the first element found, or null.
 */
async function waitForAnySelector(selectors: string[], timeout = 5000): Promise<Element | null> {
  // Immediate check
  for (let i = 0; i < selectors.length; i++) {
    const el = document.querySelector(selectors[i]);
    if (el) {
      console.log(`[TomFlips:gumtree] Selector matched [${i}]: ${selectors[i]}`);
      return el;
    }
  }
  // Poll if nothing found immediately
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (let i = 0; i < selectors.length; i++) {
      const el = document.querySelector(selectors[i]);
      if (el) {
        console.log(`[TomFlips:gumtree] Selector matched [${i}]: ${selectors[i]}`);
        return el;
      }
    }
    await delay(200);
  }
  return null;
}

// Initialize the selector registry
SelectorRegistry.init().then((reg) => {
  registry = reg;
  console.log(`[TomFlips:gumtree] SelectorRegistry ready v${reg.getVersion()}`);
}).catch((err) => {
  console.warn('[TomFlips:gumtree] SelectorRegistry init failed, using bundled defaults:', err);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CREATE_LISTING') {
    createListing(message.listing)
      .then((result) => sendResponse(result))
      .catch((error) =>
        sendResponse({ success: false, error: error.message })
      );
    return true;
  }
});

async function createListing(listing: any) {
  try {
    // Check login status before proceeding
    const loginCheck = await checkLoginStatus('gumtree');
    if (!loginCheck.isLoggedIn) {
      showLoginError('gumtree');
      chrome.runtime.sendMessage({ type: 'REPORT_LISTING_STATUS', platform: 'gumtree', status: 'error', error: 'Not logged in' });
      return { success: false, error: 'Not logged in' };
    }

    if (!window.location.href.includes('/post-ad')) {
      window.location.href = 'https://www.gumtree.com/post-ad';
      return { success: false, error: 'Navigating to post page - please retry' };
    }

    await delay(2000);

    await fillField(sel('titleInput'), listing.title);
    await delay(randomDelay(500, 1000));

    await selectCategory(listing);
    await delay(randomDelay(1000, 1500));

    await fillField(sel('priceInput'), listing.price.toString());
    await delay(randomDelay(500, 1000));

    await fillField(
      sel('descriptionInput'),
      buildDescription(listing)
    );
    await delay(randomDelay(500, 1000));

    if (listing.images?.length > 0) {
      await uploadImages(listing.images);
      await delay(2000);
    }

    await fillField(
      sel('postcodeInput'),
      listing.postcode || 'SW1A 1AA'
    );
    await delay(randomDelay(500, 1000));

    console.log('[TomFlips:gumtree] All fields filled. Review and publish manually.');

    chrome.runtime.sendMessage({
      type: 'REPORT_LISTING_STATUS',
      listingId: listing.id,
      marketplace: 'gumtree',
      status: { success: true },
    });

    showSuccessToast('Gumtree');
    return { success: true };
  } catch (error: any) {
    chrome.runtime.sendMessage({
      type: 'REPORT_LISTING_STATUS',
      listingId: listing.id,
      marketplace: 'gumtree',
      status: { success: false, error: error.message },
    });
    return { success: false, error: error.message };
  }
}

async function fillField(selectors: string[], value: string) {
  const element = await waitForAnySelector(selectors) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  if (!element) throw new Error(`Could not find element for selectors: ${selectors.join(', ')}`);

  element.focus();
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function selectCategory(_listing: any) {
  const categoryPath = ['For Sale', 'Home & Garden', 'Sofas & Armchairs'];

  for (const category of categoryPath) {
    const categorySelectors = sel('categoryOption');
    const options = document.querySelectorAll(categorySelectors.join(', '));
    for (const option of options) {
      if (option.textContent?.includes(category)) {
        (option as HTMLElement).click();
        await delay(1000);
        break;
      }
    }
  }
}

async function uploadImages(images: Array<{ url: string; dataUrl?: string }>) {
  const fileInput = await waitForAnySelector(sel('fileInput')) as HTMLInputElement;
  if (!fileInput) throw new Error('Could not find image upload input');

  for (const image of images.slice(0, 10)) {
    try {
      let blob: Blob;
      if (image.dataUrl) {
        // Use pre-fetched data URL from background (avoids CORS)
        const response = await fetch(image.dataUrl);
        blob = await response.blob();
      } else {
        // Fallback: direct fetch
        const response = await fetch(image.url);
        if (!response.ok) {
          console.warn('[TomFlips:gumtree] Failed to fetch image:', image.url);
          continue;
        }
        blob = await response.blob();
      }

      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));

      await delay(1500);
    } catch (err) {
      console.warn('[TomFlips:gumtree] Error uploading image:', err);
      continue;
    }
  }
}


function buildDescription(listing: any): string {
  let desc = listing.description || listing.title;

  if (
    listing.dimensionsLengthCm ||
    listing.dimensionsWidthCm ||
    listing.dimensionsHeightCm
  ) {
    desc += '\n\nDimensions:';
    if (listing.dimensionsLengthCm)
      desc += `\n- Length: ${listing.dimensionsLengthCm}cm`;
    if (listing.dimensionsWidthCm)
      desc += `\n- Width: ${listing.dimensionsWidthCm}cm`;
    if (listing.dimensionsHeightCm)
      desc += `\n- Height: ${listing.dimensionsHeightCm}cm`;
  }

  if (listing.brand) desc += `\n\nBrand: ${listing.brand}`;
  if (listing.material) desc += `\nMaterial: ${listing.material}`;
  if (listing.color) desc += `\nColour: ${listing.color}`;

  desc += '\n\nCollection only. Cash on collection.';

  return desc;
}
