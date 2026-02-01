import type { SelectorConfig, HealthCheckResult } from './types';

/**
 * Generate a health check probe script for a given platform.
 *
 * The returned function string can be injected via chrome.scripting.executeScript
 * into a tab on the platform's domain. It calls document.querySelector() on each
 * selector in the config and returns a HealthCheckResult.
 */
export function generateHealthCheckProbe(
  config: SelectorConfig,
  platform: string
): string {
  const platformConfig = config.platforms[platform];
  if (!platformConfig) {
    throw new Error(`No selector config for platform: ${platform}`);
  }

  // Serialize the selectors map as JSON for injection
  const selectorsJson = JSON.stringify(platformConfig.selectors);

  // Return an IIFE string that runs in the target tab context
  return `
    (function() {
      const selectors = ${selectorsJson};
      const results = {};
      let totalKeys = 0;
      let foundKeys = 0;

      for (const [key, versions] of Object.entries(selectors)) {
        totalKeys++;
        let found = false;
        let matchedIndex = -1;
        let matchedVersion = null;

        for (let i = 0; i < versions.length; i++) {
          try {
            const el = document.querySelector(versions[i].css);
            if (el) {
              found = true;
              matchedIndex = i;
              matchedVersion = versions[i].version;
              break;
            }
          } catch (e) {
            // Invalid selector — skip
          }
        }

        if (found) foundKeys++;
        results[key] = { found, matchedIndex, matchedVersion };
      }

      const ratio = totalKeys > 0 ? foundKeys / totalKeys : 0;
      let overallStatus = 'broken';
      if (ratio > 0.8) overallStatus = 'healthy';
      else if (ratio >= 0.5) overallStatus = 'degraded';

      return {
        platform: '${platform}',
        timestamp: new Date().toISOString(),
        results,
        overallStatus,
      };
    })();
  `;
}

/**
 * Run a health check for a platform using the current DOM.
 * This version runs directly in a content script context (no injection needed).
 */
export function runHealthCheck(
  config: SelectorConfig,
  platform: string
): HealthCheckResult {
  const platformConfig = config.platforms[platform];
  if (!platformConfig) {
    return {
      platform,
      timestamp: new Date().toISOString(),
      results: {},
      overallStatus: 'broken',
    };
  }

  const results: HealthCheckResult['results'] = {};
  let totalKeys = 0;
  let foundKeys = 0;

  for (const [key, versions] of Object.entries(platformConfig.selectors)) {
    totalKeys++;
    let found = false;
    let matchedIndex = -1;
    let matchedVersion: string | null = null;

    for (let i = 0; i < versions.length; i++) {
      try {
        const el = document.querySelector(versions[i].css);
        if (el) {
          found = true;
          matchedIndex = i;
          matchedVersion = versions[i].version;
          break;
        }
      } catch {
        // Invalid selector — skip
      }
    }

    if (found) foundKeys++;
    results[key] = { found, matchedIndex, matchedVersion };
  }

  const ratio = totalKeys > 0 ? foundKeys / totalKeys : 0;
  let overallStatus: HealthCheckResult['overallStatus'] = 'broken';
  if (ratio > 0.8) overallStatus = 'healthy';
  else if (ratio >= 0.5) overallStatus = 'degraded';

  return {
    platform,
    timestamp: new Date().toISOString(),
    results,
    overallStatus,
  };
}
