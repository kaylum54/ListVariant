# ADR-005: Image Pre-fetch in Service Worker

## Status
Accepted

## Context
Content scripts running on marketplace sites (e.g., facebook.com) cannot fetch images from localhost due to CORS restrictions. MV3 service workers don't have access to `FileReader`.

## Decision
Pre-fetch images in the background service worker using `arrayBuffer()` + `btoa()` to convert to data URLs before sending to content scripts.

## Consequences
- Background script fetches each image URL, converts to base64 data URL
- Data URLs are sent as part of the `CREATE_LISTING` message to content scripts
- Content scripts convert data URLs back to `Blob` → `File` for upload inputs
- No CORS issues since background scripts have full network access
- Slightly higher memory usage due to base64 encoding (~33% larger than binary)
- `FileReader` is never used (not available in MV3 service workers)
