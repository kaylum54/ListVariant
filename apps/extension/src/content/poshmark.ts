import { AutomationFramework, ListingData } from '../lib/automation/AutomationFramework';
import { SelectorRegistry } from '../lib/selectors/SelectorRegistry';
import { delay } from '../utils/delay';

// Bundled fallback selectors — used if registry is not initialized
const SELECTORS = {
  titleInput: [
    'input[name="title"]',
    '[data-testid="title-input"]',
    'input[aria-label*="title" i]',
    'input[placeholder*="title" i]',
    '#title',
  ],
  descriptionInput: [
    'textarea[name="description"]',
    '[data-testid="description-input"]',
    'textarea[aria-label*="description" i]',
    'textarea[placeholder*="description" i]',
    '#description',
  ],
  priceInput: [
    'input[name="price"]',
    'input[name="listingPrice"]',
    '[data-testid="price-input"]',
    'input[aria-label*="listing price" i]',
    'input[placeholder*="listing price" i]',
  ],
  originalPriceInput: [
    'input[name="originalPrice"]',
    '[data-testid="original-price-input"]',
    'input[aria-label*="original" i]',
    'input[placeholder*="original" i]',
  ],
  categoryButton: [
    'button[aria-label*="category" i]',
    '[data-testid="category-select"]',
    '[data-testid="category"]',
    '.category-select',
  ],
  brandInput: [
    'input[name="brand"]',
    '[data-testid="brand-input"]',
    'input[aria-label*="brand" i]',
    'input[placeholder*="brand" i]',
  ],
  sizeButton: [
    'button[aria-label*="size" i]',
    '[data-testid="size-select"]',
    '[data-testid="size"]',
  ],
  conditionButton: [
    'button[aria-label*="condition" i]',
    '[data-testid="condition-select"]',
  ],
  coverPhotoInput: [
    'input[type="file"][data-testid="cover-photo"]',
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
  ],
  fileInput: [
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
  ],
};

/** Get selectors from registry if available, otherwise use bundled defaults */
function sel(registry: SelectorRegistry | null, key: keyof typeof SELECTORS): string[] {
  if (registry) {
    const fromRegistry = registry.getSelectors('poshmark', key);
    if (fromRegistry.length > 0) return fromRegistry;
  }
  return SELECTORS[key];
}

class PoshmarkAutomation extends AutomationFramework {
  protected readonly platform = 'poshmark';
  protected readonly createPageUrl = 'https://poshmark.co.uk/create-listing';

  protected async verifyLoggedIn(): Promise<void> {
    const avatar = document.querySelector('[data-testid="user-avatar"], [class*="Avatar"], [class*="avatar"], .user-menu, nav [href*="/closet"]');
    if (!avatar) {
      this.log('No avatar/profile link found — may not be logged in');
    }
  }

  protected async uploadImages(images: Array<{ url: string; dataUrl?: string }>): Promise<void> {
    if (!images.length) return;

    // Poshmark requires a cover photo (first image)
    const coverInput = await this.waitForAnySelector(sel(this.registry, 'coverPhotoInput')) as HTMLInputElement | null;
    if (coverInput) {
      // Upload cover photo (first image)
      await this.uploadImageFile(coverInput, [images[0]]);
      this.log('Cover photo uploaded');
      await delay(1000);

      // Upload remaining images
      if (images.length > 1) {
        const additionalInput = await this.waitForAnySelector(sel(this.registry, 'fileInput')) as HTMLInputElement | null;
        if (additionalInput && additionalInput !== coverInput) {
          await this.uploadImageFile(additionalInput, images.slice(1));
        } else {
          // Same input for all photos
          await this.uploadImageFile(coverInput, images.slice(1));
        }
      }
    } else {
      // Fallback: single file input
      const fileInput = await this.waitForAnySelector(sel(this.registry, 'fileInput')) as HTMLInputElement | null;
      if (fileInput) {
        await this.uploadImageFile(fileInput, images);
      } else {
        this.error('Could not find file input for image upload');
      }
    }
  }

  protected async fillBasicInfo(data: ListingData): Promise<void> {
    // Title (required field — throw if not found)
    const titleInput = await this.waitForAnySelector(sel(this.registry, 'titleInput')) as HTMLInputElement | null;
    if (titleInput) {
      await this.typeText(titleInput, data.title);
      await this.humanDelay();
    } else {
      throw new Error('Could not find title input');
    }

    // Description
    const descInput = await this.waitForAnySelector(sel(this.registry, 'descriptionInput')) as HTMLTextAreaElement | null;
    if (descInput) {
      const desc = this.buildDescription(data);
      await this.typeText(descInput, desc);
      await this.humanDelay();
    } else {
      this.log('Description input not found, skipping');
    }

    // Listing price
    const priceInput = await this.waitForAnySelector(sel(this.registry, 'priceInput')) as HTMLInputElement | null;
    if (priceInput) {
      await this.typeText(priceInput, data.price.toString());
      await this.humanDelay();
    } else {
      this.log('Price input not found, skipping');
    }

    // Original price (required by Poshmark)
    const origPriceInput = await this.waitForAnySelector(sel(this.registry, 'originalPriceInput')) as HTMLInputElement | null;
    if (origPriceInput) {
      const originalPrice = Math.round(data.price * 1.3); // 30% markup as "original"
      await this.typeText(origPriceInput, originalPrice.toString());
      await this.humanDelay();
    } else {
      this.log('Original price input not found, skipping');
    }
  }

  protected async fillPlatformSpecificFields(data: ListingData): Promise<void> {
    // Category
    try {
      await this.selectCategory(data);
    } catch (err: any) {
      this.log('Category selection failed, continuing: ' + (err?.message || ''));
    }

    // Brand (required)
    try {
      if (data.brand) {
        await this.fillBrand(data.brand);
      } else {
        // Poshmark requires brand — use generic
        await this.fillBrand('Unbranded');
      }
    } catch (err: any) {
      this.log('Brand fill failed, continuing: ' + (err?.message || ''));
    }

    // Size
    try {
      await this.selectSize();
    } catch (err: any) {
      this.log('Size selection failed, continuing: ' + (err?.message || ''));
    }

    // Condition
    if (data.condition) {
      try {
        await this.selectCondition(data.condition);
      } catch (err: any) {
        this.log('Condition selection failed, continuing: ' + (err?.message || ''));
      }
    }
  }

  private async selectCategory(data: ListingData): Promise<void> {
    const catBtn = await this.waitForAnySelector(sel(this.registry, 'categoryButton'));
    if (!catBtn) {
      this.log('Category button not found, skipping');
      return;
    }

    (catBtn as HTMLElement).click();
    await delay(800);

    // Navigate to Home > Furniture
    const searchForText = async (text: string) => {
      const options = document.querySelectorAll('[role="option"], [role="menuitem"], li, button, a');
      for (const option of options) {
        if (option.textContent?.toLowerCase().includes(text.toLowerCase())) {
          (option as HTMLElement).click();
          await delay(600);
          return true;
        }
      }
      return false;
    };

    await searchForText('Home');
    await searchForText('Furniture');
  }

  private async fillBrand(brand: string): Promise<void> {
    const brandInput = await this.waitForAnySelector(sel(this.registry, 'brandInput')) as HTMLInputElement | null;
    if (brandInput) {
      await this.typeText(brandInput, brand);
      await delay(1000);
      // Select from autocomplete
      const suggestion = document.querySelector('[role="option"], [class*="suggestion" i], [class*="Suggestion"]');
      if (suggestion) {
        (suggestion as HTMLElement).click();
      }
      await this.humanDelay();
    }
  }

  private async selectSize(): Promise<void> {
    const sizeBtn = await this.waitForAnySelector(sel(this.registry, 'sizeButton'));
    if (!sizeBtn) return;

    (sizeBtn as HTMLElement).click();
    await delay(500);

    // For furniture, select "One Size" or "OS" or "N/A"
    const options = document.querySelectorAll('[role="option"], [role="menuitem"], li, button');
    for (const option of options) {
      const text = option.textContent?.toLowerCase() || '';
      if (text.includes('one size') || text === 'os' || text.includes('n/a') || text.includes('not applicable')) {
        (option as HTMLElement).click();
        await this.humanDelay();
        return;
      }
    }
  }

  private async selectCondition(condition: string): Promise<void> {
    const conditionMap: Record<string, string> = {
      new: 'NWT',
      used_like_new: 'NWOT',
      used_good: 'Good',
      used_fair: 'Fair',
    };

    const target = conditionMap[condition] || 'Good';
    const btn = await this.waitForAnySelector(sel(this.registry, 'conditionButton'));
    if (btn) {
      (btn as HTMLElement).click();
      await delay(500);
      const options = document.querySelectorAll('[role="option"], [role="radio"], [role="menuitem"], li, button');
      for (const option of options) {
        if (option.textContent?.toLowerCase().includes(target.toLowerCase())) {
          (option as HTMLElement).click();
          break;
        }
      }
      await this.humanDelay();
    }
  }

  private buildDescription(data: ListingData): string {
    let desc = data.description || data.title;
    const details: string[] = [];
    if (data.brand) details.push(`Brand: ${data.brand}`);
    if (data.material) details.push(`Material: ${data.material}`);
    if (data.color) details.push(`Colour: ${data.color}`);
    if (data.dimensionsLengthCm || data.dimensionsWidthCm || data.dimensionsHeightCm) {
      const dims = [
        data.dimensionsLengthCm ? `L: ${data.dimensionsLengthCm}cm` : '',
        data.dimensionsWidthCm ? `W: ${data.dimensionsWidthCm}cm` : '',
        data.dimensionsHeightCm ? `H: ${data.dimensionsHeightCm}cm` : '',
      ].filter(Boolean).join(' x ');
      details.push(`Dimensions: ${dims}`);
    }
    if (details.length > 0) {
      desc += '\n\n' + details.join('\n');
    }
    return desc;
  }
}

// --- Initialize & Message listener ---
const automation = new PoshmarkAutomation();

console.log('[SyncSellr:poshmark] Content script loaded on:', window.location.href);

// Initialize the selector registry asynchronously
automation.initRegistry().then((reg) => {
  console.log(`[SyncSellr:poshmark] SelectorRegistry ready v${reg.getVersion()}`);
}).catch((err) => {
  console.warn('[SyncSellr:poshmark] SelectorRegistry init failed, using bundled defaults:', err);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[SyncSellr:poshmark] Message received:', message.type);
  if (message.type === 'CREATE_LISTING' && (!message.platform || message.platform === 'poshmark')) {
    automation.createListing(message.listing)
      .then((result) => {
        console.log('[SyncSellr:poshmark] createListing result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('[SyncSellr:poshmark] createListing error:', error);
        sendResponse({ success: false, error: error?.message || String(error) });
      });
    return true;
  }
});
