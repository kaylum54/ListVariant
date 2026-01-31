import { delay, randomDelay } from '../utils/delay';
import { waitForElement } from '../utils/dom';

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
    if (!window.location.href.includes('/post-ad')) {
      window.location.href = 'https://www.gumtree.com/post-ad';
      return { success: false, error: 'Navigating to post page - please retry' };
    }

    await delay(2000);

    await fillField('input[name="title"]', listing.title);
    await delay(randomDelay(500, 1000));

    await selectCategory(listing);
    await delay(randomDelay(1000, 1500));

    await fillField('input[name="price"]', listing.price.toString());
    await delay(randomDelay(500, 1000));

    await fillField(
      'textarea[name="description"]',
      buildDescription(listing)
    );
    await delay(randomDelay(500, 1000));

    if (listing.images?.length > 0) {
      await uploadImages(listing.images);
      await delay(2000);
    }

    await fillField(
      'input[name="postcode"]',
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

async function fillField(selector: string, value: string) {
  const element = (await waitForElement(selector, 5000)) as
    | HTMLInputElement
    | HTMLTextAreaElement;
  if (!element) throw new Error(`Could not find element: ${selector}`);

  element.focus();
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

async function selectCategory(_listing: any) {
  const categoryPath = ['For Sale', 'Home & Garden', 'Sofas & Armchairs'];

  for (const category of categoryPath) {
    const options = document.querySelectorAll(
      '[data-testid="category-option"], .category-item'
    );
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
  const fileInput = (await waitForElement(
    'input[type="file"]',
    5000
  )) as HTMLInputElement;
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
