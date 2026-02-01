import type { SelectorConfig, VersionedSelector } from './types';

const V1_DATE = '2026-01-31';

/** Helper to create a v1 versioned selector */
function v1(css: string, notes?: string): VersionedSelector {
  return { css, version: 'v1', addedAt: V1_DATE, notes };
}

/**
 * Bundled default selector configuration.
 * This is the offline fallback — always available even without API access.
 * Extracted from the original hardcoded selectors in each content script.
 */
export const DEFAULT_SELECTOR_CONFIG: SelectorConfig = {
  version: '1.0.0',
  updatedAt: V1_DATE,
  platforms: {
    // ──────────────────────────────────────────────
    // VINTED
    // ──────────────────────────────────────────────
    vinted: {
      platform: 'vinted',
      version: '1.0.0',
      updatedAt: V1_DATE,
      selectors: {
        titleInput: [
          v1('input[name="title"]', 'Primary name attribute selector'),
          v1('[data-testid="title-input"]', 'Test ID fallback'),
          v1('input[aria-label*="title" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="title" i]', 'Placeholder text fallback'),
        ],
        descriptionInput: [
          v1('textarea[name="description"]', 'Primary name attribute selector'),
          v1('[data-testid="description-input"]', 'Test ID fallback'),
          v1('textarea[aria-label*="description" i]', 'Accessibility label fallback'),
          v1('textarea[placeholder*="description" i]', 'Placeholder text fallback'),
        ],
        priceInput: [
          v1('input[name="price"]', 'Primary name attribute selector'),
          v1('[data-testid="price-input"]', 'Test ID fallback'),
          v1('input[aria-label*="price" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="price" i]', 'Placeholder text fallback'),
        ],
        categoryButton: [
          v1('[data-testid="category-select"]', 'Test ID selector'),
          v1('button[aria-label*="category" i]', 'Accessibility label fallback'),
          v1('[data-testid="catalog-select"]', 'Alternate test ID'),
        ],
        brandInput: [
          v1('input[name="brand"]', 'Primary name attribute selector'),
          v1('[data-testid="brand-input"]', 'Test ID fallback'),
          v1('input[aria-label*="brand" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="brand" i]', 'Placeholder text fallback'),
        ],
        conditionSelect: [
          v1('[data-testid="condition-select"]', 'Test ID selector'),
          v1('button[aria-label*="condition" i]', 'Accessibility label fallback'),
          v1('select[name="status"]', 'Legacy select fallback'),
        ],
        colorSelect: [
          v1('[data-testid="color-select"]', 'Test ID selector'),
          v1('button[aria-label*="colo" i]', 'Accessibility label fallback (partial match for color/colour)'),
        ],
        fileInput: [
          v1('input[type="file"][accept*="image"]', 'File input with image accept'),
          v1('input[type="file"]', 'Generic file input fallback'),
        ],
      },
    },

    // ──────────────────────────────────────────────
    // DEPOP
    // ──────────────────────────────────────────────
    depop: {
      platform: 'depop',
      version: '1.0.0',
      updatedAt: V1_DATE,
      selectors: {
        titleInput: [
          v1('input[name="title"]', 'Primary name attribute selector'),
          v1('[data-testid="title"]', 'Test ID fallback'),
          v1('input[aria-label*="title" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="describe" i]', 'Depop-specific placeholder fallback'),
          v1('input[placeholder*="title" i]', 'Placeholder text fallback'),
        ],
        descriptionInput: [
          v1('textarea[name="description"]', 'Primary name attribute selector'),
          v1('[data-testid="description"]', 'Test ID fallback'),
          v1('textarea[aria-label*="description" i]', 'Accessibility label fallback'),
          v1('textarea[placeholder*="describe" i]', 'Placeholder text fallback'),
        ],
        priceInput: [
          v1('input[name="price"]', 'Primary name attribute selector'),
          v1('[data-testid="price"]', 'Test ID fallback'),
          v1('input[aria-label*="price" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="price" i]', 'Placeholder text fallback'),
          v1('input[type="number"]', 'Numeric input fallback'),
        ],
        categoryButton: [
          v1('button[aria-label*="category" i]', 'Accessibility label selector'),
          v1('[data-testid="category-select"]', 'Test ID fallback'),
          v1('[data-testid="category"]', 'Short test ID fallback'),
        ],
        conditionButton: [
          v1('button[aria-label*="condition" i]', 'Accessibility label selector'),
          v1('[data-testid="condition"]', 'Test ID fallback'),
          v1('[data-testid="condition-select"]', 'Alt test ID fallback'),
        ],
        fileInput: [
          v1('input[type="file"][accept*="image"]', 'File input with image accept'),
          v1('input[type="file"]', 'Generic file input fallback'),
        ],
      },
    },

    // ──────────────────────────────────────────────
    // POSHMARK
    // ──────────────────────────────────────────────
    poshmark: {
      platform: 'poshmark',
      version: '1.0.0',
      updatedAt: V1_DATE,
      selectors: {
        titleInput: [
          v1('input[name="title"]', 'Primary name attribute selector'),
          v1('[data-testid="title-input"]', 'Test ID fallback'),
          v1('input[aria-label*="title" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="title" i]', 'Placeholder text fallback'),
          v1('#title', 'ID selector fallback'),
        ],
        descriptionInput: [
          v1('textarea[name="description"]', 'Primary name attribute selector'),
          v1('[data-testid="description-input"]', 'Test ID fallback'),
          v1('textarea[aria-label*="description" i]', 'Accessibility label fallback'),
          v1('textarea[placeholder*="description" i]', 'Placeholder text fallback'),
          v1('#description', 'ID selector fallback'),
        ],
        priceInput: [
          v1('input[name="price"]', 'Primary name attribute selector'),
          v1('input[name="listingPrice"]', 'Poshmark-specific name'),
          v1('[data-testid="price-input"]', 'Test ID fallback'),
          v1('input[aria-label*="listing price" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="listing price" i]', 'Placeholder text fallback'),
        ],
        originalPriceInput: [
          v1('input[name="originalPrice"]', 'Primary name attribute selector'),
          v1('[data-testid="original-price-input"]', 'Test ID fallback'),
          v1('input[aria-label*="original" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="original" i]', 'Placeholder text fallback'),
        ],
        categoryButton: [
          v1('button[aria-label*="category" i]', 'Accessibility label selector'),
          v1('[data-testid="category-select"]', 'Test ID fallback'),
          v1('[data-testid="category"]', 'Short test ID fallback'),
          v1('.category-select', 'Class selector fallback'),
        ],
        brandInput: [
          v1('input[name="brand"]', 'Primary name attribute selector'),
          v1('[data-testid="brand-input"]', 'Test ID fallback'),
          v1('input[aria-label*="brand" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="brand" i]', 'Placeholder text fallback'),
        ],
        sizeButton: [
          v1('button[aria-label*="size" i]', 'Accessibility label selector'),
          v1('[data-testid="size-select"]', 'Test ID fallback'),
          v1('[data-testid="size"]', 'Short test ID fallback'),
        ],
        conditionButton: [
          v1('button[aria-label*="condition" i]', 'Accessibility label selector'),
          v1('[data-testid="condition-select"]', 'Test ID fallback'),
        ],
        coverPhotoInput: [
          v1('input[type="file"][data-testid="cover-photo"]', 'Poshmark cover photo input'),
          v1('input[type="file"][accept*="image"]', 'File input with image accept'),
          v1('input[type="file"]', 'Generic file input fallback'),
        ],
        fileInput: [
          v1('input[type="file"][accept*="image"]', 'File input with image accept'),
          v1('input[type="file"]', 'Generic file input fallback'),
        ],
      },
    },

    // ──────────────────────────────────────────────
    // GUMTREE
    // ──────────────────────────────────────────────
    gumtree: {
      platform: 'gumtree',
      version: '1.0.0',
      updatedAt: V1_DATE,
      selectors: {
        titleInput: [
          v1('input[name="title"]', 'Primary name attribute selector'),
          v1('[data-testid="title-input"]', 'Test ID fallback'),
          v1('input[aria-label*="title" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="title" i]', 'Placeholder text fallback'),
          v1('#title', 'ID selector fallback'),
        ],
        priceInput: [
          v1('input[name="price"]', 'Primary name attribute selector'),
          v1('[data-testid="price-input"]', 'Test ID fallback'),
          v1('input[aria-label*="price" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="price" i]', 'Placeholder text fallback'),
          v1('#price', 'ID selector fallback'),
        ],
        descriptionInput: [
          v1('textarea[name="description"]', 'Primary name attribute selector'),
          v1('[data-testid="description-input"]', 'Test ID fallback'),
          v1('textarea[aria-label*="description" i]', 'Accessibility label fallback'),
          v1('textarea[placeholder*="description" i]', 'Placeholder text fallback'),
          v1('#description', 'ID selector fallback'),
        ],
        postcodeInput: [
          v1('input[name="postcode"]', 'Primary name attribute selector'),
          v1('[data-testid="postcode-input"]', 'Test ID fallback'),
          v1('input[aria-label*="postcode" i]', 'Accessibility label fallback'),
          v1('input[placeholder*="postcode" i]', 'Placeholder text fallback'),
          v1('#postcode', 'ID selector fallback'),
        ],
        categoryOption: [
          v1('[data-testid="category-option"]', 'Test ID selector'),
          v1('.category-item', 'Class selector fallback'),
          v1('[role="option"]', 'ARIA role fallback'),
          v1('[role="menuitem"]', 'Menu item role fallback'),
        ],
        fileInput: [
          v1('input[type="file"][accept*="image"]', 'File input with image accept'),
          v1('input[type="file"]', 'Generic file input fallback'),
          v1('[data-testid="image-upload"]', 'Test ID fallback'),
        ],
      },
    },
  },
};
