import { delay, randomDelay } from '../../utils/delay';
import { waitForElement } from '../../utils/dom';

export interface ListingData {
  id: string;
  title: string;
  description?: string;
  price: number;
  condition?: string;
  brand?: string;
  material?: string;
  color?: string;
  dimensionsLengthCm?: number;
  dimensionsWidthCm?: number;
  dimensionsHeightCm?: number;
  images?: Array<{ url: string; dataUrl?: string; position: number }>;
  category?: string;
}

export abstract class AutomationFramework {
  protected abstract readonly platform: string;
  protected abstract readonly createPageUrl: string;

  // Template method — orchestrates the full listing flow
  async createListing(data: ListingData): Promise<{ success: boolean; error?: string }> {
    try {
      this.log('Starting listing creation', {
        title: data.title,
        price: data.price,
        condition: data.condition,
        hasDescription: !!data.description,
        imageCount: data.images?.length || 0,
      });

      await this.verifyLoggedIn();
      this.log('Login verified');

      await this.navigateToCreatePage();
      await delay(2000);
      this.log('On create page');

      if (data.images && data.images.length > 0) {
        await this.uploadImages(data.images);
        await delay(1500);
        this.log('Images uploaded');
      }

      await this.fillBasicInfo(data);
      await delay(500);
      this.log('Basic info filled');

      await this.fillPlatformSpecificFields(data);
      await delay(500);
      this.log('Platform-specific fields filled');

      this.log('All fields filled. Review and publish manually.');
      this.reportSuccess(data.id);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.message || String(error) || 'Unknown error';
      this.error('Listing creation failed', errorMessage);
      this.reportFailure(data.id, errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // --- Steps to override ---

  protected async verifyLoggedIn(): Promise<void> {
    // Default: assume logged in. Override per platform if needed.
  }

  protected async navigateToCreatePage(): Promise<void> {
    const currentUrl = window.location.href;
    // Use a more precise check: the current URL must start with the create page URL
    // (or contain it as a path segment) to avoid false positives
    const isOnCreatePage = currentUrl.startsWith(this.createPageUrl) ||
      currentUrl.includes(new URL(this.createPageUrl).pathname);
    if (!isOnCreatePage) {
      this.log('Navigating to create page:', this.createPageUrl);
      window.location.href = this.createPageUrl;
      await delay(3000);
    } else {
      this.log('Already on create page, skipping navigation');
    }
  }

  protected abstract uploadImages(images: Array<{ url: string; dataUrl?: string }>): Promise<void>;
  protected abstract fillBasicInfo(data: ListingData): Promise<void>;
  protected abstract fillPlatformSpecificFields(data: ListingData): Promise<void>;

  // --- Shared Utilities ---

  protected async waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
    return waitForElement(selector, timeout);
  }

  protected async waitForAnySelector(selectors: string[], timeout = 5000): Promise<Element | null> {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    // Poll if nothing found immediately
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) return el;
      }
      await delay(200);
    }
    return null;
  }

  protected async typeText(element: HTMLInputElement | HTMLTextAreaElement, text: string): Promise<void> {
    element.focus();
    // Use native setter for React-controlled inputs
    const nativeSetter =
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    if (nativeSetter) {
      nativeSetter.call(element, text);
    } else {
      element.value = text;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  protected async clickElement(selector: string): Promise<boolean> {
    const el = await this.waitForElement(selector);
    if (el) {
      (el as HTMLElement).click();
      return true;
    }
    return false;
  }

  protected async selectDropdownOption(triggerSelector: string, optionText: string): Promise<boolean> {
    const trigger = await this.waitForElement(triggerSelector);
    if (!trigger) return false;

    (trigger as HTMLElement).click();
    await delay(500);

    // Search in common dropdown patterns
    const options = document.querySelectorAll(
      '[role="option"], [role="menuitem"], [role="listbox"] [role="option"], li, [data-value]'
    );
    for (const option of options) {
      if (option.textContent?.trim().toLowerCase().includes(optionText.toLowerCase())) {
        (option as HTMLElement).click();
        return true;
      }
    }
    return false;
  }

  protected async uploadImageFile(
    fileInput: HTMLInputElement,
    images: Array<{ url: string; dataUrl?: string }>
  ): Promise<void> {
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      try {
        let blob: Blob;
        if (image.dataUrl) {
          // Convert data URL to blob using arrayBuffer+btoa pattern (NOT FileReader)
          // Data URLs from background script are already base64-encoded
          const [header, b64Data] = image.dataUrl.split(',');
          const mimeMatch = header.match(/data:([^;]+)/);
          const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const binaryString = atob(b64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
          blob = new Blob([bytes], { type: mime });
          this.log(`Using pre-fetched data URL for image ${i + 1}`);
        } else {
          // Fallback: direct fetch (may fail due to CORS in content scripts)
          this.log(`Fetching image directly: ${image.url}`);
          const response = await fetch(image.url);
          if (!response.ok) {
            this.error(`Failed to fetch image ${i + 1}`, `HTTP ${response.status}`);
            continue;
          }
          blob = await response.blob();
        }

        const fileName = `image_${i + 1}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.log(`Image ${i + 1}/${images.length} attached to file input`);
        await delay(1500);
      } catch (err: any) {
        this.error(`Image ${i + 1} upload failed`, err?.message || String(err));
      }
    }
  }

  protected humanDelay(min = 300, max = 800): Promise<void> {
    return delay(randomDelay(min, max));
  }

  // --- Status Reporting ---

  protected reportSuccess(listingId: string): void {
    try {
      chrome.runtime.sendMessage({
        type: 'REPORT_LISTING_STATUS',
        listingId,
        marketplace: this.platform,
        status: { success: true },
      });
    } catch (err) {
      this.error('Failed to report success (extension context may be invalidated)');
    }
  }

  protected reportFailure(listingId: string, error: string): void {
    try {
      chrome.runtime.sendMessage({
        type: 'REPORT_LISTING_STATUS',
        listingId,
        marketplace: this.platform,
        status: { success: false, error },
      });
    } catch (err) {
      this.error('Failed to report failure (extension context may be invalidated)');
    }
  }

  // --- Logging ---

  protected log(message: string, data?: any): void {
    const prefix = `[TomFlips:${this.platform}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  protected error(message: string, detail?: string): void {
    console.error(`[TomFlips:${this.platform}]`, message, detail || '');
  }
}
