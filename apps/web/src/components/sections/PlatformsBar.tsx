'use client';

import { motion } from 'framer-motion';
import { EbayLogo, FacebookLogo, GumtreeLogo } from '../icons/PlatformLogos';

const platforms = [
  { name: 'eBay', Icon: EbayLogo },
  { name: 'Facebook Marketplace', Icon: FacebookLogo },
  { name: 'Gumtree', Icon: GumtreeLogo },
];

export const PlatformsBar = () => {
  return (
    <section className="py-16 bg-neutral-50 border-y border-neutral-200" aria-label="Supported marketplace platforms">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-neutral-500 mb-8 text-sm font-medium uppercase tracking-wide">
          Cross-list to these platforms
        </p>
        <div className="flex justify-center items-center gap-12 md:gap-16 flex-wrap">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <platform.Icon className="w-10 h-10" />
              <span className="font-semibold text-lg text-neutral-700">
                {platform.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
