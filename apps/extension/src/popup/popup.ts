interface Listing {
  id: string;
  title: string;
  price: number;
  condition: string;
  description?: string;
  images?: { id: string; url: string }[];
}

let listings: Listing[] = [];

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('auth-status')!;
  const authSection = document.getElementById('auth-section')!;
  const connectedSection = document.getElementById('connected-section')!;
  const listingSelect = document.getElementById('listing-select') as HTMLSelectElement;
  const listFacebookBtn = document.getElementById('list-facebook') as HTMLButtonElement;
  const listGumtreeBtn = document.getElementById('list-gumtree') as HTMLButtonElement;
  const listingStatusEl = document.getElementById('listing-status')!;

  // Check auth status
  const authStatus = await chrome.runtime.sendMessage({
    type: 'GET_AUTH_STATUS',
  });

  if (authStatus.authenticated) {
    statusEl.className = 'status connected';
    statusEl.textContent = `Connected as ${authStatus.user.name || authStatus.user.email}`;
    authSection.style.display = 'none';
    connectedSection.style.display = 'block';

    // Fetch listings
    await loadListings(listingSelect, listFacebookBtn, listGumtreeBtn);
  } else {
    statusEl.className = 'status disconnected';
    statusEl.textContent = 'Not connected';
    authSection.style.display = 'block';
    connectedSection.style.display = 'none';
  }

  // Listing selector change
  listingSelect.addEventListener('change', () => {
    const hasSelection = listingSelect.value !== '';
    listFacebookBtn.disabled = !hasSelection;
    listGumtreeBtn.disabled = !hasSelection;
  });

  // Cross-list buttons
  listFacebookBtn.addEventListener('click', () => {
    crossListTo('facebook', listingStatusEl);
  });

  listGumtreeBtn.addEventListener('click', () => {
    crossListTo('gumtree', listingStatusEl);
  });

  // Event listeners
  document.getElementById('login-btn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
  });

  document.getElementById('open-dashboard')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });

  document.getElementById('open-listings')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/listings' });
  });

  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    statusEl.className = 'status disconnected';
    statusEl.textContent = 'Not connected';
    authSection.style.display = 'block';
    connectedSection.style.display = 'none';
  });
});

async function loadListings(
  selectEl: HTMLSelectElement,
  fbBtn: HTMLButtonElement,
  gtBtn: HTMLButtonElement
) {
  try {
    const result = await chrome.runtime.sendMessage({
      type: 'GET_PENDING_LISTINGS',
      marketplace: 'all',
    });

    if (result.error) {
      selectEl.innerHTML = '<option value="">Failed to load listings</option>';
      return;
    }

    // Result is { listings: [...], total, page, limit, totalPages }
    listings = result.listings || result;

    if (listings.length === 0) {
      selectEl.innerHTML = '<option value="">No listings found</option>';
      return;
    }

    selectEl.innerHTML = '<option value="">-- Select a listing --</option>';
    for (const listing of listings) {
      const option = document.createElement('option');
      option.value = listing.id;
      option.textContent = `${listing.title} - £${listing.price}`;
      selectEl.appendChild(option);
    }

    fbBtn.disabled = true;
    gtBtn.disabled = true;
  } catch (err) {
    selectEl.innerHTML = '<option value="">Error loading listings</option>';
  }
}

async function crossListTo(marketplace: 'facebook' | 'gumtree', statusEl: HTMLElement) {
  const selectEl = document.getElementById('listing-select') as HTMLSelectElement;
  const selectedId = selectEl.value;
  if (!selectedId) return;

  const listing = listings.find((l) => l.id === selectedId);
  if (!listing) return;

  statusEl.style.display = 'block';
  statusEl.className = 'status connected';
  statusEl.textContent = `Opening ${marketplace}...`;

  // Delegate to background service worker (popup closes when tab opens)
  chrome.runtime.sendMessage({
    type: 'CROSS_LIST',
    marketplace,
    listing: {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      condition: listing.condition,
      description: listing.description || listing.title,
      images: listing.images || [],
    },
  });
}
