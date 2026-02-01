// Platform login detection configs
interface PlatformLoginConfig {
  name: string;
  loginUrl: string;
  loggedInSelectors: string[];    // Elements that indicate logged in
  loggedOutSelectors: string[];   // Elements that indicate NOT logged in
}

const PLATFORM_CONFIGS: Record<string, PlatformLoginConfig> = {
  facebook: {
    name: 'Facebook Marketplace',
    loginUrl: 'https://www.facebook.com/login',
    loggedInSelectors: [
      '[aria-label="Your profile"]',
      '[aria-label="Account"]',
      '[data-testid="royal_profile_photo"]',
      'svg[aria-label="Your profile"]',
    ],
    loggedOutSelectors: [
      'input[name="email"]',
      'form[action*="login"]',
      '[data-testid="royal_login_button"]',
    ],
  },
  gumtree: {
    name: 'Gumtree',
    loginUrl: 'https://www.gumtree.com/login',
    loggedInSelectors: [
      '[data-testid="user-menu"]',
      '.user-menu',
      'a[href*="/my-account"]',
      'a[href*="/manage"]',
    ],
    loggedOutSelectors: [
      'a[href*="/login"]',
      'form[action*="login"]',
      '[data-testid="login-button"]',
    ],
  },
  vinted: {
    name: 'Vinted',
    loginUrl: 'https://www.vinted.co.uk/member/login',
    loggedInSelectors: [
      '[data-testid="user-avatar"]',
      '.web_ui__Avatar',
      '[class*="Avatar"]',
      'a[href*="/member/items"]',
    ],
    loggedOutSelectors: [
      'a[href*="/member/login"]',
      '[data-testid="login-button"]',
      'button[data-testid="header--login-button"]',
    ],
  },
  depop: {
    name: 'Depop',
    loginUrl: 'https://www.depop.com/login',
    loggedInSelectors: [
      '[data-testid="user-avatar"]',
      '[class*="Avatar"]',
      'nav [href*="/profile"]',
      'a[href*="/selling"]',
    ],
    loggedOutSelectors: [
      'a[href*="/login"]',
      '[data-testid="login-button"]',
      'form[action*="login"]',
    ],
  },
  poshmark: {
    name: 'Poshmark',
    loginUrl: 'https://poshmark.co.uk/login',
    loggedInSelectors: [
      '[data-testid="user-avatar"]',
      '.user-menu',
      'nav [href*="/closet"]',
      'a[href*="/closet"]',
    ],
    loggedOutSelectors: [
      'a[href*="/login"]',
      '[data-testid="login-button"]',
      'form[action*="login"]',
    ],
  },
};

interface LoginCheckResult {
  isLoggedIn: boolean;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Check if user is logged into the current platform.
 * Waits briefly for page to settle, then checks indicators.
 */
export async function checkLoginStatus(platform: string): Promise<LoginCheckResult> {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return { isLoggedIn: true, confidence: 'low' };

  // Wait for page to settle
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Check logged-out indicators first (more reliable)
  for (const selector of config.loggedOutSelectors) {
    if (document.querySelector(selector)) {
      return { isLoggedIn: false, confidence: 'high' };
    }
  }

  // Check logged-in indicators
  for (const selector of config.loggedInSelectors) {
    if (document.querySelector(selector)) {
      return { isLoggedIn: true, confidence: 'high' };
    }
  }

  // Neither found — assume logged in, let form filling fail naturally
  return { isLoggedIn: true, confidence: 'low' };
}

/**
 * Show a login error overlay on the page.
 */
export function showLoginError(platform: string): void {
  const config = PLATFORM_CONFIGS[platform];
  if (!config) return;

  // Remove existing overlay if any
  const existing = document.getElementById('syncsellr-login-error');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'syncsellr-login-error';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      ">
        <div style="
          width: 56px;
          height: 56px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          font-size: 24px;
        ">&#x1f512;</div>
        <h2 style="
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        ">Not Logged In</h2>
        <p style="
          margin: 0 0 24px;
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        ">You need to be logged into ${config.name} to create a listing. Log in and try again.</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="syncsellr-login-close" style="
            padding: 10px 20px;
            border-radius: 8px;
            border: 1px solid #d1d5db;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">Close</button>
          <a href="${config.loginUrl}" target="_blank" rel="noopener noreferrer" style="
            padding: 10px 20px;
            border-radius: 8px;
            border: none;
            background: #2563eb;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          ">Log In to ${config.name}</a>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close button handler
  document.getElementById('syncsellr-login-close')?.addEventListener('click', () => {
    overlay.remove();
  });

  // Click backdrop to close
  overlay.firstElementChild?.addEventListener('click', (e) => {
    if (e.target === overlay.firstElementChild) {
      overlay.remove();
    }
  });
}

/**
 * Show a success toast after form filling completes.
 */
export function showSuccessToast(platformName: string): void {
  // Remove existing toast
  const existing = document.getElementById('syncsellr-success-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'syncsellr-success-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #065f46;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: syncsellr-slide-in 0.3s ease-out;
      max-width: 400px;
    ">
      <div style="
        width: 32px;
        height: 32px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 16px;
      ">&#x2713;</div>
      <div>
        <div style="font-weight: 600; font-size: 14px;">Listing Filled!</div>
        <div style="font-size: 13px; opacity: 0.9; margin-top: 2px;">Review and publish on ${platformName}</div>
      </div>
    </div>
    <style>
      @keyframes syncsellr-slide-in {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    </style>
  `;

  document.body.appendChild(toast);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'opacity 0.3s ease-out';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

export { PLATFORM_CONFIGS };
export type { PlatformLoginConfig, LoginCheckResult };
