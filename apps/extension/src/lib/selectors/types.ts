/**
 * Selector Resilience System — Type Definitions
 *
 * These types define the versioned selector configuration that powers
 * fallback resolution across all marketplace content scripts.
 */

/** A single CSS selector with version metadata */
export interface VersionedSelector {
  css: string;
  version: string;      // e.g., "2026-01-31" or "v1"
  addedAt: string;      // ISO date
  notes?: string;
}

/** All selectors for a single marketplace platform */
export interface PlatformSelectors {
  platform: string;
  version: string;       // overall config version for this platform
  updatedAt: string;
  selectors: Record<string, VersionedSelector[]>;
}

/** Top-level selector configuration across all platforms */
export interface SelectorConfig {
  version: string;
  updatedAt: string;
  platforms: Record<string, PlatformSelectors>;
}

/** Result of a health check probe for a single platform */
export interface HealthCheckResult {
  platform: string;
  timestamp: string;
  results: Record<string, {
    found: boolean;
    matchedIndex: number;
    matchedVersion: string | null;
  }>;
  overallStatus: 'healthy' | 'degraded' | 'broken';
}
