const API_URL = 'http://localhost:4000/api';
const DEFAULT_TIMEOUT_MS = 15000; // 15 second request timeout

/**
 * Fetch wrapper with timeout support.
 * Aborts the request if it exceeds the specified timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export class API {
  static async getMe(token: string) {
    const response = await fetchWithTimeout(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch user (HTTP ${response.status})`);
    return response.json();
  }

  static async getPendingListings(token: string, marketplace: string) {
    const params = marketplace ? `?marketplace=${encodeURIComponent(marketplace)}` : '';
    const response = await fetchWithTimeout(
      `${API_URL}/listings${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error(`Failed to fetch listings (HTTP ${response.status})`);
    return response.json();
  }

  static async getListing(token: string, listingId: string) {
    const response = await fetchWithTimeout(`${API_URL}/listings/${encodeURIComponent(listingId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`Failed to fetch listing (HTTP ${response.status})`);
    return response.json();
  }

  static async reportListingStatus(
    token: string,
    listingId: string,
    marketplace: string,
    status: { success: boolean; externalId?: string; error?: string }
  ) {
    const response = await fetchWithTimeout(
      `${API_URL}/listings/${encodeURIComponent(listingId)}/marketplace-status`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ marketplace, ...status }),
      }
    );
    if (!response.ok) throw new Error(`Failed to report status (HTTP ${response.status})`);
    return response.json();
  }
}
