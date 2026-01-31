'use client';

import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 px-4 bg-neutral-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Tom Flips - Home">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg" aria-hidden="true" />
            <span className="font-bold text-lg">Tom Flips</span>
          </Link>

          <nav aria-label="Footer navigation" className="flex gap-8 text-sm text-neutral-400">
            <a href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="mailto:support@tomflips.co.uk" className="hover:text-white transition-colors">
              Support
            </a>
          </nav>

          <p className="text-neutral-500 text-sm">
            &copy; {currentYear} Tom Flips. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
