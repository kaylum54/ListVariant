import { AutomationFramework, ListingData } from '../lib/automation/AutomationFramework';
import { delay } from '../utils/delay';

const SELECTORS = {
  titleInput: [
    'input[name="title"]',
    '[data-testid="title"]',
    'input[aria-label*="title" i]',
    'input[placeholder*="describe" i]',
    'input[placeholder*="title" i]',
  ],
  descriptionInput: [
    'textarea[name="description"]',
    '[data-testid="description"]',
    'textarea[aria-label*="description" i]',
    'textarea[placeholder*="describe" i]',
  ],
  priceInput: [
    'input[name="price"]',
    '[data-testid="price"]',
    'input[aria-label*="price" i]',
    'input[placeholder*="price" i]',
    'input[type="number"]',
  ],
  categoryButton: [
    'button[aria-label*="category" i]',
    '[data-testid="category-select"]',
    '[data-testid="category"]',
  ],
  conditionButton: [
    'button[aria-label*="condition" i]',
    '[data-testid="condition"]',
    '[data-testid="condition-select"]',
  ],
  fileInput: [
    'input[type="file"][accept*="image"]',
    'input[type="file"]',
  ],
};

class DepopAutomation extends AutomationFramework {
  protected readonly platform = 'depop';
  protected readonly createPageUrl = 'https://www.depop.com/products/create';

  protected async verifyLoggedIn(): Promise<void> {
    const avatar = document.querySelector('[data-testid="user-avatar"], [class*="Avatar"], [class*="avatar"], nav [href*="/profile"]');
    if (!avatar) {
      this.log('No avatar/profile link found — may not be logged in');
    }
  }

  protected async uploadImages(images: Array<{ url: string; dataUrl?: string }>): Promise<void> {
    const fileInput = await this.waitForAnySelector(SELECTORS.fileInput) as HTMLInputElement | null;
    if (!fileInput) {
      this.error('Could not find file input for image upload');
      return;
    }
    await this.uploadImageFile(fileInput, images);
  }

  protected async fillBasicInfo(data: ListingData): Promise<void> {
    // Title (required field — throw if not found)
    const titleInput = await this.waitForAnySelector(SELECTORS.titleInput) as HTMLInputElement | null;
    if (titleInput) {
      await this.typeText(titleInput, data.title);
      await this.humanDelay();
    } else {
      throw new Error('Could not find title input');
    }

    // Description (Depop uses description prominently — includes hashtags)
    const descInput = await this.waitForAnySelector(SELECTORS.descriptionInput) as HTMLTextAreaElement | null;
    if (descInput) {
      const desc = this.buildDescriptionWithHashtags(data);
      await this.typeText(descInput, desc);
      await this.humanDelay();
    } else {
      this.log('Description input not found, skipping');
    }

    // Price
    const priceInput = await this.waitForAnySelector(SELECTORS.priceInput) as HTMLInputElement | null;
    if (priceInput) {
      await this.typeText(priceInput, data.price.toString());
      await this.humanDelay();
    } else {
      this.log('Price input not found, skipping');
    }
  }

  protected async fillPlatformSpecificFields(data: ListingData): Promise<void> {
    // Category
    try {
      await this.selectCategory(data);
    } catch (err: any) {
      this.log('Category selection failed, continuing: ' + (err?.message || ''));
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
    const catBtn = await this.waitForAnySelector(SELECTORS.categoryButton);
    if (!catBtn) {
      this.log('Category button not found, skipping');
      return;
    }

    (catBtn as HTMLElement).click();
    await delay(800);

    // Depop categories are fashion-focused; furniture maps to "Home"
    const categorySearch = document.querySelector('input[type="search"], input[placeholder*="search" i]');
    if (categorySearch) {
      await this.typeText(categorySearch as HTMLInputElement, 'Home');
      await delay(500);
    }

    const options = document.querySelectorAll('[role="option"], [role="menuitem"], li, button');
    for (const option of options) {
      const text = option.textContent?.toLowerCase() || '';
      if (text.includes('home') || text.includes('furniture') || text.includes('homeware')) {
        (option as HTMLElement).click();
        await this.humanDelay();
        break;
      }
    }
  }

  private async selectCondition(condition: string): Promise<void> {
    const conditionMap: Record<string, string> = {
      new: 'Brand new',
      used_like_new: 'Like new',
      used_good: 'Good',
      used_fair: 'Fair',
    };

    const target = conditionMap[condition] || 'Good';
    const btn = await this.waitForAnySelector(SELECTORS.conditionButton);
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

  private buildDescriptionWithHashtags(data: ListingData): string {
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

    // Generate hashtags for Depop discovery
    const hashtags = this.generateHashtags(data);
    if (hashtags.length > 0) {
      desc += '\n\n' + hashtags.join(' ');
    }

    return desc;
  }

  private generateHashtags(data: ListingData): string[] {
    const tags: string[] = ['#furniture'];
    if (data.brand) tags.push(`#${data.brand.toLowerCase().replace(/\s+/g, '')}`);
    if (data.material) tags.push(`#${data.material.toLowerCase().replace(/\s+/g, '')}`);
    if (data.color) tags.push(`#${data.color.toLowerCase()}`);
    if (data.condition === 'new') tags.push('#brandnew');
    tags.push('#homedecor', '#interiors', '#vintage');
    return tags.slice(0, 5);
  }
}

// --- Message listener ---
const automation = new DepopAutomation();

console.log('[TomFlips:depop] Content script loaded on:', window.location.href);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log('[TomFlips:depop] Message received:', message.type);
  if (message.type === 'CREATE_LISTING' && (!message.platform || message.platform === 'depop')) {
    automation.createListing(message.listing)
      .then((result) => {
        console.log('[TomFlips:depop] createListing result:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('[TomFlips:depop] createListing error:', error);
        sendResponse({ success: false, error: error?.message || String(error) });
      });
    return true;
  }
});
