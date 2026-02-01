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
  ],
  descriptionInput: [
    'textarea[name="description"]',
    '[data-testid="description-input"]',
    'textarea[aria-label*="description" i]',
    'textarea[placeholder*="description" i]',
  ],
  priceInput: [
    'input[name="price"]',
    '[data-testid="price-input"]',
    'input[aria-label*="price" i]',
    'input[placeholder*="price" i]',
  ],
  categoryButton: [
    '[data-testid="category-select"]',
    'button[aria-label*="category" i]',
    '[data-testid="catalog-select"]',
  ],
  brandInput: [
    'input[name="brand"]',
    '[data-testid="brand-input"]',
    'input[aria-label*="brand" i]',
    'input[placeholder*="brand" i]',
  ],
  conditionSelect: [
    '[data-testid="condition-select"]',
    'button[aria-label*="condition" i]',
    'select[name="status"]',
  ],
  colorSelect: [
    '[data-testid="color-select"]',
    'button[aria-label*="colo" i]',
  ],
  fileInput: [
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
  ],
};

/** Get selectors from registry if available, otherwise use bundled defaults */
function sel(registry: SelectorRegistry | null, key: keyof typeof SELECTORS): string[] {
  if (registry) {
    const fromRegistry = registry.getSelectors('vinted', key);
    if (fromRegistry.length > 0) return fromRegistry;
  }
  return SELECTORS[key];
}

class VintedAutomation extends AutomationFramework {
  protected readonly platform = 'vinted';
  protected readonly createPageUrl = 'https://www.vinted.co.uk/items/new';

  protected async verifyLoggedIn(): Promise<void> {
    // Check for common logged-in indicators
    const avatar = document.querySelector('[data-testid="user-avatar"], .web_ui__Avatar, [class*="Avatar"]');
    if (!avatar) {
      this.log('No avatar found — may not be logged in');
    }
  }

  protected async uploadImages(images: Array<{ url: string; dataUrl?: string }>): Promise<void> {
    const fileInput = await this.waitForAnySelector(sel(this.registry, 'fileInput')) as HTMLInputElement | null;
    if (!fileInput) {
      this.error('Could not find file input for image upload');
      return;
    }
    await this.uploadImageFile(fileInput, images);
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

    // Price
    const priceInput = await this.waitForAnySelector(sel(this.registry, 'priceInput')) as HTMLInputElement | null;
    if (priceInput) {
      await this.typeText(priceInput, data.price.toString());
      await this.humanDelay();
    } else {
      this.log('Price input not found, skipping');
    }
  }

  protected async fillPlatformSpecificFields(data: ListingData): Promise<void> {
    // Category — Vinted has hierarchical selection
    try {
      await this.selectCategory(data);
    } catch (err: any) {
      this.log('Category selection failed, continuing: ' + (err?.message || ''));
    }

    // Brand
    if (data.brand) {
      try {
        const brandInput = await this.waitForAnySelector(sel(this.registry, 'brandInput')) as HTMLInputElement | null;
        if (brandInput) {
          await this.typeText(brandInput, data.brand);
          await delay(1000);
          // Select from autocomplete dropdown
          const suggestion = document.querySelector('[role="option"], [class*="Suggestion"], [class*="suggestion"]');
          if (suggestion) {
            (suggestion as HTMLElement).click();
            await this.humanDelay();
          }
        }
      } catch (err: any) {
        this.log('Brand fill failed, continuing: ' + (err?.message || ''));
      }
    }

    // Condition
    if (data.condition) {
      try {
        await this.selectCondition(data.condition);
      } catch (err: any) {
        this.log('Condition selection failed, continuing: ' + (err?.message || ''));
      }
    }

    // Color
    if (data.color) {
      try {
        const colorBtn = await this.waitForAnySelector(sel(this.registry, 'colorSelect'));
        if (colorBtn) {
          (colorBtn as HTMLElement).click();
          await delay(500);
          const options = document.querySelectorAll('[role="option"], [class*="color" i] button, [class*="Color" i] button');
          for (const option of options) {
            if (option.textContent?.toLowerCase().includes(data.color!.toLowerCase())) {
              (option as HTMLElement).click();
              break;
            }
          }
          await this.humanDelay();
        }
      } catch (err: any) {
        this.log('Color selection failed, continuing: ' + (err?.message || ''));
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
    await delay(1000);

    // Navigate: Home > Furniture > type
    const steps = ['Home', 'Furniture'];
    for (const step of steps) {
      const options = document.querySelectorAll('[role="option"], [role="menuitem"], [class*="catalog"] button, [class*="Catalog"] button, li');
      for (const option of options) {
        if (option.textContent?.trim().toLowerCase().includes(step.toLowerCase())) {
          (option as HTMLElement).click();
          await delay(800);
          break;
        }
      }
    }
  }

  private async selectCondition(condition: string): Promise<void> {
    const conditionMap: Record<string, string> = {
      new: 'New with tags',
      used_like_new: 'New without tags',
      used_good: 'Very good',
      used_fair: 'Good',
    };

    const target = conditionMap[condition] || 'Good';
    const btn = await this.waitForAnySelector(sel(this.registry, 'conditionSelect'));
    if (btn) {
      (btn as HTMLElement).click();
      await delay(500);
      const options = document.querySelectorAll('[role="option"], [role="radio"], [role="menuitem"]');
      for (const option of options) {
        if (option.textContent?.toLowerCase().includes(target.toLowerCase())) {
          (option as HTMLElement).click();
          break;
        }
      }
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
const automation = new VintedAutomation();

console.log('[SyncSellr:vinted] Content script loaded on:', window.location.href);

// Initialize the selector registry asynchronously
automation.initRegistry().then((reg) => {
  console.log(`[SyncSellr:vinted] SelectorRegistry ready v${reg.getVersion()}`);
}).catch((err) => {
  console.warn('[SyncSellr:vinted] SelectorRegistry init failed, using bundled defaults:', err);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[SyncSellr:vinted] Message received:', message.type);
  if (message.type === 'CREATE_LISTING' && (!message.platform || message.platform === 'vinted')) {
    automation.createListing(message.listing)
      .then((result) => {
        console.log('[SyncSellr:vinted] createListing result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('[SyncSellr:vinted] createListing error:', error);
        sendResponse({ success: false, error: error?.message || String(error) });
      });
    return true;
  }
});
