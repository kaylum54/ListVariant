import { delay, randomDelay } from '../utils/delay';
import { waitForElement } from '../utils/dom';

console.log('[TomFlips] Facebook content script loaded on:', window.location.href);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[TomFlips] Message received:', message.type);
  if (message.type === 'CREATE_LISTING') {
    createListing(message.listing)
      .then((result) => {
        console.log('[TomFlips] createListing result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('[TomFlips] createListing error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

async function createListing(listing: any) {
  console.log('[TomFlips] Starting createListing with data:', {
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    hasDescription: !!listing.description,
    imageCount: listing.images?.length || 0,
  });

  try {
    // Step 1: Make sure we're on the create page
    console.log('[TomFlips] Step 1: Navigate to create listing');
    await navigateToCreateListing();
    await delay(2000);

    // Step 2: Select "Item for Sale" if the listing type chooser is shown
    console.log('[TomFlips] Step 2: Select "Item for Sale"');
    await selectItemForSale();
    // Wait longer for the form to load after selection
    await delay(3000);

    // Step 3: Log what form elements we can find
    await logFormElements();

    // Step 4: Fill text fields
    console.log('[TomFlips] Step 4: Fill title');
    await fillTitle(listing.title);
    await delay(randomDelay(500, 1000));

    console.log('[TomFlips] Step 5: Fill price');
    await fillPrice(listing.price);
    await delay(randomDelay(500, 1000));

    // Step 5: Upload images (using pre-fetched data URLs from background)
    if (listing.images?.length > 0) {
      console.log('[TomFlips] Step 6: Upload images');
      await uploadImages(listing.images);
      await delay(2000);
    }

    // Step 6: Select category
    console.log('[TomFlips] Step 7: Select category');
    await selectCategory('Furniture');
    await delay(randomDelay(500, 1000));

    // Step 7: Select condition
    if (listing.condition) {
      console.log('[TomFlips] Step 8: Select condition');
      await selectCondition(listing.condition);
      await delay(randomDelay(500, 1000));
    }

    // Step 8: Fill description
    console.log('[TomFlips] Step 9: Fill description');
    await fillDescription(listing.description || listing.title);
    await delay(randomDelay(500, 1000));

    console.log('[TomFlips] All fields filled. Review and publish manually.');
    return { success: true };
  } catch (error: any) {
    console.error('[TomFlips] Error during listing creation:', error.message);
    chrome.runtime.sendMessage({
      type: 'REPORT_LISTING_STATUS',
      listingId: listing.id,
      marketplace: 'facebook',
      status: { success: false, error: error.message },
    });
    return { success: false, error: error.message };
  }
}

async function navigateToCreateListing() {
  if (window.location.href.includes('/marketplace/create')) {
    console.log('[TomFlips] Already on create page, skipping navigation');
    return;
  }
  window.location.href = 'https://www.facebook.com/marketplace/create/item';
}

async function selectItemForSale() {
  // Try aria-label selectors first
  const selectors = [
    '[aria-label="Item for Sale"]',
    '[aria-label="Item for sale"]',
    '[aria-label="Item For Sale"]',
  ];

  for (const selector of selectors) {
    const button = await waitForElement(selector, 2000);
    if (button) {
      console.log('[TomFlips] Found "Item for Sale" with selector:', selector);
      (button as HTMLElement).click();
      return;
    }
  }

  // Fallback: find by text content
  const allElements = document.querySelectorAll('[role="button"], a, div[tabindex="0"], span');
  for (const el of allElements) {
    const text = el.textContent?.trim().toLowerCase();
    if (text === 'item for sale') {
      console.log('[TomFlips] Found "Item for Sale" by text content');
      (el as HTMLElement).click();
      return;
    }
  }

  console.log('[TomFlips] Could not find "Item for Sale" button - may already be on item form');
}

// Debug helper: log all form elements we can find
async function logFormElements() {
  const inputs = document.querySelectorAll('input:not([type="hidden"])');
  console.log('[TomFlips] Visible inputs found:', inputs.length);
  inputs.forEach((el, i) => {
    const input = el as HTMLInputElement;
    console.log(`[TomFlips]   input[${i}] type=${input.type} aria-label="${input.getAttribute('aria-label')}" placeholder="${input.placeholder}" name="${input.name}" id="${input.id}"`);
  });

  const textareas = document.querySelectorAll('textarea');
  console.log('[TomFlips] Textareas found:', textareas.length);
  textareas.forEach((el, i) => {
    console.log(`[TomFlips]   textarea[${i}] aria-label="${el.getAttribute('aria-label')}" placeholder="${el.placeholder}" name="${el.name}"`);
  });

  const editables = document.querySelectorAll('[contenteditable="true"]');
  console.log('[TomFlips] Contenteditable elements found:', editables.length);
  editables.forEach((el, i) => {
    console.log(`[TomFlips]   editable[${i}] aria-label="${el.getAttribute('aria-label')}" role="${el.getAttribute('role')}" tag=${el.tagName}`);
  });

  const labels = document.querySelectorAll('label');
  console.log('[TomFlips] Labels found:', labels.length);
  labels.forEach((el, i) => {
    const text = el.textContent?.trim().substring(0, 40);
    console.log(`[TomFlips]   label[${i}] text="${text}" for="${el.getAttribute('for')}"`);
  });

  // Look for any element with role="textbox"
  const textboxes = document.querySelectorAll('[role="textbox"]');
  console.log('[TomFlips] Elements with role=textbox:', textboxes.length);
  textboxes.forEach((el, i) => {
    console.log(`[TomFlips]   textbox[${i}] aria-label="${el.getAttribute('aria-label')}" tag=${el.tagName}`);
  });

  // Look for spans containing field names
  const spans = document.querySelectorAll('span');
  const fieldNames = ['title', 'price', 'category', 'condition', 'description', 'location'];
  const relevantSpans: string[] = [];
  spans.forEach((el) => {
    const text = el.textContent?.trim().toLowerCase() || '';
    if (fieldNames.some(f => text === f)) {
      relevantSpans.push(el.textContent?.trim() || '');
    }
  });
  if (relevantSpans.length > 0) {
    console.log('[TomFlips] Field-name spans found:', relevantSpans.join(', '));
  }
}

async function uploadImages(images: Array<{ url: string; dataUrl?: string }>) {
  console.log('[TomFlips] Looking for file input...');
  const fileInput = await waitForElement(
    'input[type="file"][accept*="image"], input[type="file"]',
    5000
  ) as HTMLInputElement | null;

  if (!fileInput) {
    console.warn('[TomFlips] Could not find image upload input, skipping images');
    return;
  }
  console.log('[TomFlips] Found file input, uploading', images.length, 'images');

  for (const image of images) {
    try {
      let blob: Blob;
      if (image.dataUrl) {
        // Use pre-fetched data URL from background script (avoids CORS)
        const response = await fetch(image.dataUrl);
        blob = await response.blob();
        console.log('[TomFlips] Using pre-fetched data URL for image');
      } else {
        // Fallback: try direct fetch
        console.log('[TomFlips] Fetching image directly:', image.url);
        const response = await fetch(image.url);
        if (!response.ok) {
          console.warn('[TomFlips] Failed to fetch image:', response.status);
          continue;
        }
        blob = await response.blob();
      }

      const file = new File([blob], 'image.jpg', { type: blob.type || 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[TomFlips] Image attached to file input');

      await delay(1500);
    } catch (err: any) {
      console.warn('[TomFlips] Error uploading image:', err.message);
    }
  }
}

async function fillTitle(title: string) {
  const input = await findInputByLabel('Title');
  if (!input) {
    console.error('[TomFlips] Could not find title input');
    throw new Error('Could not find title input');
  }
  await setFieldValue(input, title);
  console.log('[TomFlips] Title filled:', title);
}

async function fillPrice(price: number) {
  const input = await findInputByLabel('Price');
  if (!input) {
    console.warn('[TomFlips] Could not find price input, skipping');
    return;
  }
  await setFieldValue(input, price.toString());
  console.log('[TomFlips] Price filled:', price);
}

async function selectCategory(category: string) {
  const categoryButton = await findClickableByLabel('Category');
  if (categoryButton) {
    categoryButton.click();
    await delay(1000);

    const options = document.querySelectorAll('[role="option"], [role="menuitem"], [role="listbox"] [role="option"]');
    console.log('[TomFlips] Found', options.length, 'category options');
    for (const option of options) {
      if (option.textContent?.includes(category)) {
        (option as HTMLElement).click();
        console.log('[TomFlips] Selected category:', category);
        return;
      }
    }

    // Also try clicking spans with the category text
    const allOptions = document.querySelectorAll('div[role="dialog"] span, div[role="listbox"] span');
    for (const option of allOptions) {
      if (option.textContent?.trim().includes(category)) {
        (option as HTMLElement).click();
        console.log('[TomFlips] Selected category by text:', category);
        return;
      }
    }

    console.warn('[TomFlips] Category not found:', category);
  } else {
    console.warn('[TomFlips] Category button not found, skipping');
  }
}

async function selectCondition(condition: string) {
  const conditionMap: Record<string, string> = {
    new: 'New',
    used_like_new: 'Used - Like New',
    used_good: 'Used - Good',
    used_fair: 'Used - Fair',
  };

  const conditionButton = await findClickableByLabel('Condition');
  if (conditionButton) {
    conditionButton.click();
    await delay(1000);

    const options = document.querySelectorAll('[role="option"], [role="menuitem"]');
    const targetText = conditionMap[condition] || 'Used - Good';
    for (const option of options) {
      if (option.textContent?.includes(targetText)) {
        (option as HTMLElement).click();
        console.log('[TomFlips] Selected condition:', targetText);
        return;
      }
    }
    console.warn('[TomFlips] Condition option not found:', targetText);
  } else {
    console.warn('[TomFlips] Condition button not found, skipping');
  }
}

async function fillDescription(description: string) {
  // Try textarea first
  const textarea = await findInputByLabel('Description');
  if (textarea) {
    await setFieldValue(textarea, description);
    console.log('[TomFlips] Description filled');
    return;
  }

  // Try contenteditable
  const editables = document.querySelectorAll('[contenteditable="true"]');
  for (const el of editables) {
    const label = el.getAttribute('aria-label') || '';
    if (label.toLowerCase().includes('description') || label.toLowerCase().includes('write')) {
      (el as HTMLElement).focus();
      (el as HTMLElement).textContent = description;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, data: description }));
      console.log('[TomFlips] Description filled via contenteditable');
      return;
    }
  }

  // Try any textarea
  const anyTextarea = document.querySelector('textarea');
  if (anyTextarea) {
    await setFieldValue(anyTextarea, description);
    console.log('[TomFlips] Description filled via fallback textarea');
    return;
  }

  console.warn('[TomFlips] Could not find description field, skipping');
}

// --- Helper functions ---

// Find an input/textarea by its associated label text
async function findInputByLabel(labelText: string): Promise<HTMLInputElement | HTMLTextAreaElement | null> {
  // Strategy 1: aria-label attribute (case-insensitive search)
  const ariaSelectors = [
    `input[aria-label="${labelText}"]`,
    `textarea[aria-label="${labelText}"]`,
    `input[aria-label="${labelText.toLowerCase()}"]`,
    `textarea[aria-label="${labelText.toLowerCase()}"]`,
  ];

  for (const selector of ariaSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      console.log(`[TomFlips] Found "${labelText}" field via aria-label`);
      return el as HTMLInputElement | HTMLTextAreaElement;
    }
  }

  // Strategy 2: placeholder text
  const placeholderSelectors = [
    `input[placeholder*="${labelText}" i]`,
    `textarea[placeholder*="${labelText}" i]`,
  ];

  for (const selector of placeholderSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      console.log(`[TomFlips] Found "${labelText}" field via placeholder`);
      return el as HTMLInputElement | HTMLTextAreaElement;
    }
  }

  // Strategy 3: Find a <label> or <span> with the text, then find the nearby input
  const allLabels = document.querySelectorAll('label, span');
  for (const label of allLabels) {
    if (label.textContent?.trim().toLowerCase() === labelText.toLowerCase()) {
      // Check for a direct child input
      const childInput = label.querySelector('input, textarea');
      if (childInput) {
        console.log(`[TomFlips] Found "${labelText}" field via label child`);
        return childInput as HTMLInputElement | HTMLTextAreaElement;
      }

      // Check for "for" attribute
      const forId = label.getAttribute('for');
      if (forId) {
        const el = document.getElementById(forId);
        if (el) {
          console.log(`[TomFlips] Found "${labelText}" field via label[for]`);
          return el as HTMLInputElement | HTMLTextAreaElement;
        }
      }

      // Check the next sibling or parent's next sibling for an input
      let sibling = label.nextElementSibling;
      while (sibling) {
        const input = sibling.querySelector('input, textarea') || (sibling.matches('input, textarea') ? sibling : null);
        if (input) {
          console.log(`[TomFlips] Found "${labelText}" field via sibling`);
          return input as HTMLInputElement | HTMLTextAreaElement;
        }
        sibling = sibling.nextElementSibling;
      }

      // Check parent for nearby input
      const parent = label.parentElement;
      if (parent) {
        const nearbyInput = parent.querySelector('input:not([type="hidden"]), textarea');
        if (nearbyInput) {
          console.log(`[TomFlips] Found "${labelText}" field via parent`);
          return nearbyInput as HTMLInputElement | HTMLTextAreaElement;
        }
        // Go up one more level
        const grandparent = parent.parentElement;
        if (grandparent) {
          const gpInput = grandparent.querySelector('input:not([type="hidden"]), textarea');
          if (gpInput) {
            console.log(`[TomFlips] Found "${labelText}" field via grandparent`);
            return gpInput as HTMLInputElement | HTMLTextAreaElement;
          }
        }
      }
    }
  }

  // Strategy 4: Wait for it to appear (might still be loading)
  for (const selector of ariaSelectors) {
    const el = await waitForElement(selector, 3000);
    if (el) {
      console.log(`[TomFlips] Found "${labelText}" field via waitForElement`);
      return el as HTMLInputElement | HTMLTextAreaElement;
    }
  }

  console.warn(`[TomFlips] Could not find "${labelText}" field with any strategy`);
  return null;
}

// Find a clickable element (button, select-like) by label text
async function findClickableByLabel(labelText: string): Promise<HTMLElement | null> {
  // Try aria-label
  const el = document.querySelector(`[aria-label="${labelText}"], [aria-label="${labelText.toLowerCase()}"]`);
  if (el) return el as HTMLElement;

  // Try finding a label/span and its associated clickable
  const allLabels = document.querySelectorAll('label, span');
  for (const label of allLabels) {
    if (label.textContent?.trim().toLowerCase() === labelText.toLowerCase()) {
      const parent = label.closest('[role="button"], [tabindex="0"], button') ||
                     label.parentElement?.querySelector('[role="button"], [role="combobox"], select, [tabindex="0"]');
      if (parent) return parent as HTMLElement;
      // The label itself or its container might be clickable
      if (label.parentElement) return label.parentElement as HTMLElement;
    }
  }

  // Wait for it
  const waited = await waitForElement(`[aria-label="${labelText}"]`, 3000);
  if (waited) return waited as HTMLElement;

  return null;
}

// Set a field value using native setter + React-compatible events
async function setFieldValue(element: HTMLInputElement | HTMLTextAreaElement, text: string) {
  element.focus();

  // Use native setter to bypass React's synthetic event system
  const nativeSetter =
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
    Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

  if (nativeSetter) {
    nativeSetter.call(element, text);
  } else {
    element.value = text;
  }

  // Dispatch events React listens to
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}
