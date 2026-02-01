import type { SelectorConfig, VersionedSelector } from './types';
import { DEFAULT_SELECTOR_CONFIG } from './defaults';

const STORAGE_KEY = 'syncsellr_selector_config';

/**
 * SelectorRegistry — self-contained, offline-first selector resolution.
 *
 * This class is bundled (inlined) into each content script IIFE.
 * It reads cached config from chrome.storage.local, falling back to
 * the bundled DEFAULT_SELECTOR_CONFIG if storage is empty or unavailable.
 *
 * Usage:
 *   const registry = await SelectorRegistry.init();
 *   const selectors = registry.getSelectors('vinted', 'titleInput');
 *   const el = await registry.resolve('vinted', 'titleInput');
 */
export class SelectorRegistry {
  private config: SelectorConfig;
  private static instance: SelectorRegistry | null = null;

  private constructor(config: SelectorConfig) {
    this.config = config;
  }

  /**
   * Initialize the registry.
   * Tries chrome.storage.local cache first, falls back to bundled defaults.
   */
  static async init(): Promise<SelectorRegistry> {
    if (SelectorRegistry.instance) {
      return SelectorRegistry.instance;
    }

    let config: SelectorConfig = DEFAULT_SELECTOR_CONFIG;

    try {
      // Try loading cached config from chrome.storage.local
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const stored = await new Promise<SelectorConfig | null>((resolve) => {
          chrome.storage.local.get([STORAGE_KEY], (result) => {
            if (chrome.runtime.lastError) {
              console.warn('[SelectorRegistry] Storage read error:', chrome.runtime.lastError.message);
              resolve(null);
              return;
            }
            const data = result[STORAGE_KEY];
            if (data && typeof data === 'object' && data.version && data.platforms) {
              resolve(data as SelectorConfig);
            } else {
              resolve(null);
            }
          });
        });

        if (stored) {
          config = stored;
          console.log(`[SelectorRegistry] Loaded cached config v${config.version} (updated ${config.updatedAt})`);
        } else {
          console.log(`[SelectorRegistry] No cached config, using bundled defaults v${DEFAULT_SELECTOR_CONFIG.version}`);
        }
      } else {
        console.log('[SelectorRegistry] chrome.storage not available, using bundled defaults');
      }
    } catch (err) {
      console.warn('[SelectorRegistry] Failed to load cached config, using bundled defaults:', err);
    }

    SelectorRegistry.instance = new SelectorRegistry(config);
    return SelectorRegistry.instance;
  }

  /**
   * Get raw CSS selector strings for a platform + key.
   * Returns selectors in order (first = highest priority).
   * Falls back to bundled defaults if the platform/key isn't in the current config.
   */
  getSelectors(platform: string, key: string): string[] {
    const platformConfig = this.config.platforms[platform];
    if (platformConfig?.selectors[key]) {
      return platformConfig.selectors[key].map((s: VersionedSelector) => s.css);
    }

    // Fall back to bundled defaults if key missing from remote config
    const defaultPlatform = DEFAULT_SELECTOR_CONFIG.platforms[platform];
    if (defaultPlatform?.selectors[key]) {
      return defaultPlatform.selectors[key].map((s: VersionedSelector) => s.css);
    }

    return [];
  }

  /**
   * Resolve: try each selector for a platform + key, return first match.
   * Polls until timeout if nothing found immediately.
   * Logs which version matched.
   */
  async resolve(platform: string, key: string, timeout = 5000): Promise<Element | null> {
    const platformConfig = this.config.platforms[platform];
    const versionedSelectors: VersionedSelector[] =
      platformConfig?.selectors[key] ||
      DEFAULT_SELECTOR_CONFIG.platforms[platform]?.selectors[key] ||
      [];

    if (versionedSelectors.length === 0) {
      console.warn(`[SelectorRegistry] No selectors found for ${platform}.${key}`);
      return null;
    }

    // Immediate check
    for (let i = 0; i < versionedSelectors.length; i++) {
      const s = versionedSelectors[i];
      const el = document.querySelector(s.css);
      if (el) {
        console.log(`[SelectorRegistry:${platform}] ${key} resolved with selector[${i}] v${s.version}: ${s.css}`);
        return el;
      }
    }

    // Poll until timeout
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 200));
      for (let i = 0; i < versionedSelectors.length; i++) {
        const s = versionedSelectors[i];
        const el = document.querySelector(s.css);
        if (el) {
          console.log(`[SelectorRegistry:${platform}] ${key} resolved with selector[${i}] v${s.version}: ${s.css}`);
          return el;
        }
      }
    }

    console.warn(`[SelectorRegistry:${platform}] ${key} — no selector matched after ${timeout}ms`);
    return null;
  }

  /**
   * Update the config from a remote source and persist to chrome.storage.local.
   */
  async updateFromRemote(remoteConfig: SelectorConfig): Promise<void> {
    // Basic validation
    if (!remoteConfig?.version || !remoteConfig?.platforms) {
      console.warn('[SelectorRegistry] Invalid remote config, ignoring update');
      return;
    }

    this.config = remoteConfig;

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        await new Promise<void>((resolve) => {
          chrome.storage.local.set({ [STORAGE_KEY]: remoteConfig }, () => {
            if (chrome.runtime.lastError) {
              console.warn('[SelectorRegistry] Failed to persist config:', chrome.runtime.lastError.message);
            } else {
              console.log(`[SelectorRegistry] Config updated and cached: v${remoteConfig.version}`);
            }
            resolve();
          });
        });
      }
    } catch (err) {
      console.warn('[SelectorRegistry] Failed to persist config to storage:', err);
    }
  }

  /** Get the current config version string */
  getVersion(): string {
    return this.config.version;
  }

  /** Get the last updated timestamp */
  getLastUpdated(): string {
    return this.config.updatedAt;
  }

  /** Get the full config (for health checks or debugging) */
  getConfig(): SelectorConfig {
    return this.config;
  }
}
