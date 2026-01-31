# ADR-004: Browser Automation via Chrome Extension

## Status
Accepted

## Context
Most marketplace platforms (Facebook, Gumtree, Vinted, Depop, Poshmark) don't have public APIs for listing creation. We need to automate the listing process through their web UIs.

## Decision
Use a Chrome Extension (Manifest V3) with per-platform content scripts that automate form filling.

## Consequences
- Each platform has its own content script (IIFE format, built separately)
- `AutomationFramework` base class provides shared utilities (waitForElement, typeText, etc.)
- Background service worker pre-fetches images as data URLs to avoid CORS
- Selectors use multiple fallback strategies for resilience
- Human-like delays prevent anti-automation detection
- Users must be logged into each platform in their browser
- Extension popup provides the cross-list interface
