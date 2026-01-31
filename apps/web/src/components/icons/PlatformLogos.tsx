'use client';

export const EbayLogo = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} role="img" aria-label="eBay">
    <title>eBay</title>
    <rect width="40" height="40" rx="8" fill="#F7F7F7" />
    <g transform="translate(8, 14)">
      <circle cx="3" cy="6" r="2.5" fill="#E53238" />
      <circle cx="9" cy="6" r="2.5" fill="#0064D2" />
      <circle cx="15" cy="6" r="2.5" fill="#F5AF02" />
      <circle cx="21" cy="6" r="2.5" fill="#86B817" />
    </g>
  </svg>
);

export const FacebookLogo = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Facebook Marketplace">
    <title>Facebook Marketplace</title>
    <rect width="40" height="40" rx="8" fill="#1877F2" />
    <path
      d="M24 20.5h-3v9h-4v-9h-2v-3.5h2v-2c0-2.5 1.5-4 4-4h3v3.5h-2c-.5 0-1 .5-1 1v1.5h3l-.5 3.5z"
      fill="white"
    />
  </svg>
);

export const GumtreeLogo = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Gumtree">
    <title>Gumtree</title>
    <rect width="40" height="40" rx="8" fill="#72EF36" />
    <path
      d="M20 8c-1 0-2 1-2 2v4c-3 1-5 3-5 6 0 4 3 7 7 7s7-3 7-7c0-3-2-5-5-6v-4c0-1-1-2-2-2z"
      fill="white"
    />
  </svg>
);
