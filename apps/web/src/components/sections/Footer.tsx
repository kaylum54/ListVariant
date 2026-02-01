import Link from 'next/link';

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Chrome Extension', href: '#' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '#' },
  ],
  Support: [
    { label: 'Help Centre', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'Contact Support', href: 'mailto:support@syncsellr.com' },
  ],
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 px-4 bg-gray-50 border-t border-gray-200" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        {/* Top: Logo and tagline */}
        <div className="mb-12">
          <Link href="/" className="inline-block" aria-label="SyncSellr - Home">
            <span className="font-bold text-xl text-gray-900">SyncSellr</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">
            The UK&apos;s cross-listing platform for marketplace sellers.
          </p>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 text-sm mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider and copyright */}
        <div className="border-t border-gray-200 pt-8">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} SyncSellr. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
